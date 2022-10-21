import { MicroStartup } from "@ipare/micro";
import { MicroTcpOptions } from "./options";
import * as net from "net";
import { Request } from "@ipare/core";

export class MicroTcpStartup extends MicroStartup {
  constructor(readonly options: MicroTcpOptions = {}) {
    super();
    this.#server = net.createServer(this.#handler.bind(this));
  }

  readonly #server: net.Server;
  public get server() {
    return this.#server;
  }

  get #port() {
    return this.options.port ?? 2333;
  }

  #handler(socket: net.Socket) {
    let stringBuffer = "";
    socket.on("data", async (buffer) => {
      while (true) {
        stringBuffer += buffer.toString("utf-8");

        const index = stringBuffer.indexOf("#");
        if (index < 0) return;

        const contentLength = parseInt(stringBuffer.substring(0, index));
        if (isNaN(contentLength)) {
          socket.write(
            JSON.stringify({
              error: `Error length "${contentLength}"`,
              status: "error",
            })
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

    socket.on("close", () => {
      //
    });
    socket.on("error", (err) => {
      if (err["code"] == "ECONNRESET") return;

      console.error(err);
    });
  }

  async #invokeMessage(socket: net.Socket, text: string) {
    const json = JSON.parse(text);
    const req = new Request()
      .setPattern(json.pattern)
      .setBody(json.data)
      .setId(json.id);
    const res = await this.invoke(req);
    const resultJson = JSON.stringify({
      id: req.id,
      body: res.body,
    });
    const data = `${resultJson.length}#${resultJson}`;
    console.log("data", data);
    socket.write(data, "utf-8");
    socket.end();
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
        const server = this.#server.listen(port, this.options.host);
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

  async close() {
    this.#server.close();
  }
}
