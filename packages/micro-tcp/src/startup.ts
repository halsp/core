import { MicroStartup } from "@ipare/micro";
import { parseTcpBuffer, ServerPacket } from "@ipare/micro-common";
import { MicroTcpOptions } from "./options";
import * as net from "net";
import {
  closeServer,
  Context,
  dynamicListen,
  getIparePort,
  logAddress,
} from "@ipare/core";

const defaultPort = getIparePort(2333);

export class MicroTcpStartup extends MicroStartup {
  constructor(readonly options: MicroTcpOptions = {}) {
    super();

    if (options.serverOpts) {
      this.#server = net.createServer(
        options.serverOpts,
        this.#handler.bind(this)
      );
    } else {
      this.#server = net.createServer(this.#handler.bind(this));
    }

    this.#server.on("listening", () => {
      logAddress(this.#server, this.logger, "localhost");
    });
  }

  #handlers: {
    pattern: string;
    handler: (ctx: Context) => Promise<void> | void;
  }[] = [];

  readonly #server: net.Server;

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
    if ("handle" in this.options) {
      this.#server.listen(
        this.options.handle,
        this.options.backlog,
        this.options.listeningListener
      );
    } else if ("path" in this.options) {
      this.#server.listen(this.options);
    } else {
      const opts = { ...this.options, port: this.options.port ?? defaultPort };
      this.#server.listen(opts);
    }
    return this.#server;
  }

  async dynamicListen(): Promise<{ port: number; server: net.Server }> {
    const port = await dynamicListen(
      this.#server,
      this.options.port ?? defaultPort,
      this.options.backlog,
      this.options.listeningListener
    );
    return {
      port,
      server: this.#server,
    };
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
    await closeServer(this.#server, this.logger);
  }
}
