import { MicroStartup } from "@ipare/micro";
import { MicroNatsOptions } from "./options";
import { initNatsConnection, MicroNatsConnection } from "./connection";
import { Context } from "@ipare/core";
import * as nats from "nats";

export class MicroNatsStartup extends MicroStartup {
  constructor(protected readonly options: MicroNatsOptions = {}) {
    super();
    initNatsConnection.bind(this)();
  }

  #handlers: {
    pattern: string;
    handler: (ctx: Context) => Promise<void> | void;
  }[] = [];

  async listen() {
    await this.initClients();

    this.#handlers.forEach((item) => {
      this.#pattern(item.pattern, item.handler);
    });

    return this.connection;
  }

  #pattern(pattern: string, handler: (ctx: Context) => Promise<void> | void) {
    if (!this.connection) return this;

    this.connection.subscribe(this.prefix + pattern, {
      callback: (err, msg) => {
        if (err) {
          this.logger.error(err);
          return;
        }

        this.handleMessage(
          Buffer.from(msg.data),
          async ({ result, res }) => {
            if (msg.reply) {
              msg.respond(Buffer.from(result, "utf-8"), {
                headers: res.headers,
              });
            }
          },
          async (ctx) => {
            const reqHeaders = msg.headers ?? nats.headers();
            const resHeaders = nats.headers();
            Object.defineProperty(ctx.req, "headers", {
              configurable: true,
              enumerable: true,
              get: () => reqHeaders,
            });
            Object.defineProperty(ctx.res, "headers", {
              configurable: true,
              enumerable: true,
              get: () => resHeaders,
            });
            await handler(ctx);
          }
        );
      },
    });

    return this;
  }

  pattern(pattern: string, handler: (ctx: Context) => Promise<void> | void) {
    this.#handlers.push({ pattern, handler });
    return this.#pattern(pattern, handler);
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
    await this.closeClients();
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MicroNatsStartup
  extends MicroNatsConnection<MicroNatsOptions> {}
