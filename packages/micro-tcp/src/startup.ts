import { MicroException, MicroStartup } from "@ipare/micro";
import { MicroTcpOptions } from "./options";
import * as net from "net";
import { createContext, Message } from "./context";

export class MicroTcpStartup extends MicroStartup {
  constructor(readonly options: MicroTcpOptions = {}) {
    super();
    this.#server = net.createServer(this.#handler.bind(this));
  }

  protected async invoke(msg: Message): Promise<any> {
    const ctx = createContext(msg);
    await super.invoke(ctx);
    return ctx.result;
  }

  readonly #server: net.Server;
  get #port() {
    return this.options.port ?? 2333;
  }

  #handler(socket: net.Socket) {
    let stringBuffer = "";
    socket.on("data", async (buffer) => {
      while (true) {
        stringBuffer += buffer.toString("utf-8");
        console.log("stringBuffer", stringBuffer);

        const index = stringBuffer.indexOf("#");
        if (index < 0) return;

        const contentLength = parseInt(stringBuffer.substring(0, index));
        if (isNaN(contentLength)) {
          socket.write(
            JSON.stringify(
              new MicroException(
                `Error length "${contentLength}"`
              ).toPlainObject()
            )
          );
          return;
        }

        stringBuffer = stringBuffer.substring(index + 1);
        if (stringBuffer.length == contentLength) {
          await this.#invokeMessage(socket, stringBuffer);
          break;
        } else if (stringBuffer.length > contentLength) {
          const msg = stringBuffer.substring(0, contentLength);
          stringBuffer = stringBuffer.substring(contentLength + 1);
          await this.#invokeMessage(socket, msg);
          continue;
        } else {
          break;
        }
      }
    });
  }

  async #invokeMessage(socket: net.Socket, text: string) {
    const json = JSON.parse(text);
    const msg = new Message()
      .setId(json.id)
      .setPattern(json.pattern)
      .setData(json.data);
    const result = (await this.invoke(msg)) ?? {};
    const resultJson = JSON.stringify(result);
    result.id = json.id;
    const data = `${resultJson.length}#${resultJson}`;
    console.log("\ndata", data);
    socket.write(data, "utf-8");
  }

  listen(): net.Server {
    return this.#server.listen(this.#port, this.options.host);
  }

  async #dynamicListen(
    times: number
  ): Promise<{ port?: number; server: net.Server }> {
    const port = this.#port + times;

    return new Promise<{ port?: number; server: net.Server }>(
      (resolve, reject) => {
        let error = false;
        let listen = false;
        const server = this.#server.listen(port);
        server.once("listening", () => {
          listen = true;
          if (error) return;
          resolve({
            port,
            server,
          });
        });
        server.once("error", (err) => {
          error = true;
          if (listen) return;

          server.close();
          if ((err as any).code == "EADDRINUSE") {
            this.#dynamicListen(times + 1).then((svr) => {
              resolve(svr);
            });
          } else {
            reject(err);
          }
        });
      }
    );
  }
  async dynamicListen(): Promise<{ port?: number; server: net.Server }> {
    return await this.#dynamicListen(0);
  }

  close(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
