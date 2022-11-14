import { MicroStartup } from "@ipare/micro";
import { parseTcpBuffer } from "@ipare/micro-common";
import { MicroTcpOptions } from "./options";
import * as net from "net";

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
        parseTcpBuffer(buffer, async (packet) => {
          await this.handleMessage(
            packet,
            ({ result }) => {
              socket.write(`${result.length}#${result}`, "utf-8");
            },
            (ctx) => {
              Object.defineProperty(ctx, "socket", {
                configurable: true,
                enumerable: true,
                get: () => socket,
              });
            }
          );
        });
      } catch (err) {
        socket.write(
          JSON.stringify({
            status: "error",
            error: (err as Error).message,
          })
        );
      }
    });
    socket.on("close", () => {
      //
    });
    socket.on("error", (err) => {
      this.logger.error(err);
    });
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
    this.#server.removeAllListeners();
    this.#server.close();
  }
}
