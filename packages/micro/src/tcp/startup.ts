import { MicroStartup, parseMicroBody } from "../";
import { MicroTcpOptions } from "./options";
import * as net from "net";
import { Request } from "@ipare/core";
import { parseBuffer } from "./parser";

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
    socket.on("data", async (buffer) => {
      try {
        parseBuffer(
          buffer,
          async (json) => await this.#invokeMessage(socket, json)
        );
      } catch (err) {
        const error = err as Error;
        socket.write(
          JSON.stringify({
            status: "error",
            error: error.message,
          })
        );
      }
    });

    socket.on("close", () => {
      //
    });
    socket.on("error", (err) => {
      console.error(err);
    });
  }

  async #invokeMessage(socket: net.Socket, json: any) {
    const req = new Request()
      .setPath(json.pattern)
      .setBody(parseMicroBody(json.data))
      .setId(json.id);
    const res = await this.invoke(req);
    if (!req.id) return; // event

    const resultJson = JSON.stringify({
      id: req.id,
      data: res.body,
    });
    const data = `${resultJson.length}#${resultJson}`;
    socket.write(data, "utf-8");
  }

  listen(): net.Server {
    return this.#server.listen(this.#port, this.options.host);
  }

  async #dynamicListen(
    times: number
  ): Promise<{ port: number; server: net.Server }> {
    const port = this.#port + times;

    return new Promise<{ port: number; server: net.Server }>(
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
  async dynamicListen(): Promise<{ port: number; server: net.Server }> {
    return await this.#dynamicListen(0);
  }

  async close() {
    this.#server.close();
  }
}
