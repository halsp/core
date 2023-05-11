import "@halsp/micro";
import { MicroNatsOptions } from "./options";
import { Context, getHalspPort, Startup } from "@halsp/core";
import * as nats from "nats";
import { handleMessage } from "@halsp/micro";
import { ServerPacket } from "@halsp/micro-common";

declare module "@halsp/core" {
  interface Startup {
    useMicroNats(options?: MicroNatsOptions): this;
    get connection(): nats.NatsConnection;

    listen(): Promise<nats.NatsConnection>;
    close(): Promise<void>;

    register(
      pattern: string,
      handler?: (ctx: Context) => Promise<void> | void
    ): this;
  }
}

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useMicroNats = function (options?: MicroNatsOptions) {
  if (usedMap.get(this)) {
    return this;
  }
  usedMap.set(this, true);

  initStartup.call(this, options);

  return this.useMicro();
};

const jsonCodec = nats.JSONCodec();
function initStartup(this: Startup, options: MicroNatsOptions = {}) {
  const handlers: {
    pattern: string;
    handler?: (ctx: Context) => Promise<void> | void;
  }[] = [];

  this.listen = async () => {
    await this.close();

    const opt: MicroNatsOptions = { ...options };
    if (!("servers" in options) && !("port" in options)) {
      opt.port = getHalspPort(4222);
    }

    const connection = await nats.connect(opt);
    Object.defineProperty(this, "connection", {
      configurable: true,
      enumerable: true,
      get: () => connection,
    });

    handlers.forEach((item) => {
      register.bind(this)(item.pattern, item.handler);
    });

    this.logger.info(`Server started, listening port: ${opt.port}`);
    return this.connection;
  };

  this.close = async () => {
    if (this.connection && !this.connection.isClosed()) {
      await this.connection.close();
    }
    this.logger.info("Server shutdown success");
  };

  this.register = (
    pattern: string,
    handler?: (ctx: Context) => Promise<void> | void
  ) => {
    this.logger.debug(`Add pattern: ${pattern}`);
    handlers.push({ pattern, handler });
    return register.bind(this)(pattern, handler);
  };
}

function register(
  this: Startup,
  pattern: string,
  handler?: (ctx: Context) => Promise<void> | void
) {
  if (!this.connection) return this;

  this.connection.subscribe(pattern, {
    callback: (err, msg) => {
      if (err) {
        this.logger.error(err);
        return;
      }

      handleMessage.bind(this)(
        jsonCodec.decode(msg.data) as ServerPacket,
        async ({ result, res }) => {
          if (msg.reply) {
            msg.respond(jsonCodec.encode(result), {
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

function createHeaders() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const natsPkg = require("nats");
  return natsPkg.headers() as nats.MsgHdrs;
}
