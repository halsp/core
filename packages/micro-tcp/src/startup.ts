import { MicroStartup } from "@ipare/micro";
import { parseTcpBuffer, ServerPacket } from "@ipare/micro-common";
import { MicroTcpOptions } from "./options";
import * as net from "net";
import { Context } from "@ipare/core";

export class MicroTcpStartup extends MicroStartup {
  constructor(readonly options: MicroTcpOptions = {}) {
    super();
    this.#server = net.createServer(this.#handler.bind(this));
  }

  #handlers: {
    pattern: string;
    handler: (ctx: Context) => Promise<void> | void;
  }[] = [];

  readonly #server: net.Server;
  public get server() {
    return this.#server;
  }

  get #port() {
    if (process.env.IPARE_DEBUG_PORT) {
      return Number(process.env.IPARE_DEBUG_PORT);
    } else {
      return this.options.port ?? 2333;
    }
  }

  #handler(socket: net.Socket) {
    socket.on("data", async (buffer) => {
      try {
        parseTcpBuffer(buffer, async (packet) => {
          try {
            const pattern = (packet as ServerPacket).pattern;
            const handler = this.#handlers.filter(
              (item) => item.pattern == pattern
            )[0]?.handler;
            if (!handler) {
              if (packet.id) {
                this.#writeData(socket, {
                  id: packet.id,
                  error: `Can't find the pattern: ${pattern}`,
                });
              } else {
                this.logger.info(`Can't find the pattern: ${pattern}`);
                this.#writeData(socket, {
                  error: `Can't find the pattern: ${pattern}`,
                });
              }
              return;
            }

            await this.handleMessage(
              packet as ServerPacket,
              ({ result }) => {
                this.#writeData(socket, result);
              },
              async (ctx) => {
                Object.defineProperty(ctx, "socket", {
                  configurable: true,
                  enumerable: true,
                  get: () => socket,
                });
                await handler(ctx);
              }
            );
          } catch (err) {
            this.logger.error(err);
            this.#writeData(socket, {
              id: packet.id,
              error: `Internal Error`,
            });
          }
        });
      } catch (err) {
        this.logger.debug("parse tcp buffer error", err);
        this.#writeData(socket, {
          error: (err as Error).message,
        });
      }
    });
    socket.on("close", () => {
      //
    });
    socket.on("error", (err) => {
      this.logger.error(err);
    });
  }

  #writeData(socket: net.Socket, data: any) {
    const jsonResult = JSON.stringify(data);
    socket.write(`${jsonResult.length}#${jsonResult}`, "utf-8");
  }

  listen(): net.Server {
    this.#server.listen(this.#port, this.options.host);
    this.logger.info(`Server started, listening port: ${this.#port}`);
    return this.#server;
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

  pattern(pattern: string, handler: (ctx: Context) => Promise<void> | void) {
    this.logger.debug(`Add pattern: ${pattern}`);
    this.#handlers.push({ pattern, handler });
    return this;
  }

  patterns(
    ...patterns: {
      pattern: string;
      handler: (ctx: Context) => Promise<void> | void;
    }[]
  ) {
    patterns.forEach((item) => {
      this.pattern(item.pattern, item.handler);
    });
    return this;
  }

  async close() {
    this.#server.removeAllListeners();
    this.#server.close();
    this.logger.info("Server shutdown success");
  }
}
