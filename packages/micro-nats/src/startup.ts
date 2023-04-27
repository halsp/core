import { MicroStartup } from "@halsp/micro";
import { MicroNatsOptions } from "./options";
import { Context, getHalspPort } from "@halsp/core";
import * as nats from "nats";

export class MicroNatsStartup extends MicroStartup {
  constructor(protected readonly options: MicroNatsOptions = {}) {
    super();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.#jsonCodec = require("nats").JSONCodec();
  }

  #handlers: {
    pattern: string;
    handler?: (ctx: Context) => Promise<void> | void;
  }[] = [];

  protected connection?: nats.NatsConnection;
  #jsonCodec!: nats.Codec<any>;

  async listen() {
    await this.close();

    const opt: MicroNatsOptions = { ...this.options };
    if (!("servers" in this.options) && !("port" in this.options)) {
      opt.port = getHalspPort(4222);
    }

    this.connection = await nats.connect(opt);

    this.#handlers.forEach((item) => {
      this.#register(item.pattern, item.handler);
    });

    this.logger.info(`Server started, listening port: ${opt.port}`);
    return this.connection;
  }

  #register(pattern: string, handler?: (ctx: Context) => Promise<void> | void) {
    if (!this.connection) return this;

    this.connection.subscribe(pattern, {
      callback: (err, msg) => {
        if (err) {
          this.logger.error(err);
          return;
        }

        this.handleMessage(
          this.#jsonCodec.decode(msg.data),
          async ({ result, res }) => {
            if (msg.reply) {
              msg.respond(this.#jsonCodec.encode(result), {
                headers: res.headers,
              });
            }
          },
          async (ctx) => {
            const reqHeaders = msg.headers ?? createHeaders();
            const resHeaders = createHeaders();
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
            handler && (await handler(ctx));
          }
        );
      },
    });

    return this;
  }

  register(pattern: string, handler?: (ctx: Context) => Promise<void> | void) {
    this.logger.debug(`Add pattern: ${pattern}`);
    this.#handlers.push({ pattern, handler });
    return this.#register(pattern, handler);
  }

  async close() {
    if (this.connection && !this.connection.isClosed()) {
      await this.connection.close();
    }
    this.logger.info("Server shutdown success");
  }
}

function createHeaders() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const natsPkg = require("nats");
  return natsPkg.headers() as nats.MsgHdrs;
}
