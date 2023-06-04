import { MicroNatsOptions } from "../options";
import { Context, getHalspPort, Startup } from "@halsp/core";
import * as nats from "nats";
import { handleMessage } from "@halsp/micro/dist/server";
import { ServerPacket } from "@halsp/micro";

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
  let connection: nats.NatsConnection | undefined = undefined;
  this.extend("listen", async () => {
    await close.call(this, connection);

    const opt: MicroNatsOptions = { ...options };
    if (!("servers" in options) && !("port" in options)) {
      opt.port = getHalspPort(4222);
    }

    connection = await nats.connect(opt);

    this.registers.forEach((item) => {
      register.bind(this)(item.pattern, item.handler, connection);
    });

    this.logger.info(`Server started, listening port: ${opt.port}`);
    return connection;
  })
    .extend("close", async () => {
      await close.call(this, connection);
      this.logger.info("Server shutdown success");
    })
    .extend(
      "register",
      (pattern: string, handler?: (ctx: Context) => Promise<void> | void) => {
        this.logger.debug(`Add pattern: ${pattern}`);
        return register.bind(this)(pattern, handler, connection);
      }
    );
}

async function close(this: Startup, connection?: nats.NatsConnection) {
  if (connection && !connection.isClosed()) {
    await connection.close();
  }
}

function register(
  this: Startup,
  pattern: string,
  handler?: (ctx: Context) => Promise<void> | void,
  connection?: nats.NatsConnection
) {
  if (!connection) return this;

  connection.subscribe(pattern, {
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
