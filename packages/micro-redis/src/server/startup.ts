import { MicroRedisOptions } from "./options";
import { Context, getHalspPort, Startup } from "@halsp/core";
import * as redis from "redis";
import { parseJsonBuffer } from "@halsp/micro/common.internal";
import { handleMessage } from "@halsp/micro/server";

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useMicroRedis = function (options?: MicroRedisOptions) {
  if (usedMap.get(this)) {
    return this;
  }
  usedMap.set(this, true);

  initStartup.call(this, options);

  return this.useMicro();
};

function initStartup(this: Startup, options?: MicroRedisOptions) {
  let sub: redis.RedisClientType | undefined = undefined;
  let pub: redis.RedisClientType | undefined = undefined;
  this.extend("listen", async () => {
    await close.call(this, sub, pub);
    await this["initialize"]();

    const opt: MicroRedisOptions = { ...options };
    if (!("url" in opt)) {
      const port = getHalspPort(6379);
      opt.url = `redis://localhost:${port}`;
    }

    sub = redis.createClient(opt) as redis.RedisClientType;
    pub = redis.createClient(opt) as redis.RedisClientType;
    await Promise.all([pub.connect(), sub.connect()]);

    this.registers.forEach((item) => {
      register.bind(this)(item.pattern, item.handler, sub, pub);
    });

    this.logger.info(`Server started, listening url: ${opt.url}`);
    return { sub, pub };
  })
    .extend("close", async () => {
      await close.call(this, sub, pub);

      this.logger.info("Server shutdown success");
    })
    .extend(
      "register",
      (pattern: string, handler?: (ctx: Context) => Promise<void> | void) => {
        this.logger.debug(`Add pattern: ${pattern}`);
        return register.bind(this)(pattern, handler, sub, pub);
      },
    );
}

async function close(
  this: Startup,
  sub?: redis.RedisClientType,
  pub?: redis.RedisClientType,
) {
  if (pub?.isOpen) {
    await pub.quit();
  }
  if (sub?.isOpen) {
    await sub.quit();
  }
}

function register(
  this: Startup,
  pattern: string,
  handler?: (ctx: Context) => Promise<void> | void,
  sub?: redis.RedisClientType,
  pub?: redis.RedisClientType,
) {
  if (!sub) return this;
  sub.subscribe(
    pattern,
    async (buffer) => {
      handleMessage.bind(this)(
        parseJsonBuffer(buffer),
        async ({ result, req }) => {
          await pub!.publish(pattern + "." + req.id, JSON.stringify(result));
        },
        handler,
      );
    },
    true,
  );
  return this;
}
