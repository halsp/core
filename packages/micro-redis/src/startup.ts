import "@halsp/micro";
import { MicroRedisOptions } from "./options";
import { Context, getHalspPort, Startup } from "@halsp/core";
import * as redis from "redis";
import { parseJsonBuffer } from "@halsp/micro-common";
import { handleMessage } from "@halsp/micro";

declare module "@halsp/core" {
  interface Startup {
    useMicroRedis(options?: MicroRedisOptions): this;
    get pub(): redis.RedisClientType;
    get sub(): redis.RedisClientType;

    listen(): Promise<{
      pub: redis.RedisClientType;
      sub: redis.RedisClientType;
    }>;
    close(): Promise<void>;

    register(
      pattern: string,
      handler?: (ctx: Context) => Promise<void> | void
    ): this;
  }
}

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
  const handlers: {
    pattern: string;
    handler?: (ctx: Context) => Promise<void> | void;
  }[] = [];

  this.listen = async () => {
    await this.close();

    const opt: MicroRedisOptions = { ...options };
    if (!("url" in opt)) {
      const port = getHalspPort(6379);
      opt.url = `redis://localhost:${port}`;
    }

    const pub = redis.createClient(opt) as redis.RedisClientType;
    const sub = redis.createClient(opt) as redis.RedisClientType;
    Object.defineProperty(this, "pub", {
      configurable: true,
      enumerable: true,
      get: () => pub,
    });
    Object.defineProperty(this, "sub", {
      configurable: true,
      enumerable: true,
      get: () => sub,
    });
    await Promise.all([this.pub.connect(), this.sub.connect()]);

    handlers.forEach((item) => {
      register.bind(this)(item.pattern, item.handler);
    });

    this.logger.info(`Server started, listening url: ${opt.url}`);
    return {
      sub: this.sub,
      pub: this.pub,
    };
  };

  this.close = async () => {
    if (this.pub?.isOpen) {
      await this.pub.quit();
    }
    if (this.sub?.isOpen) {
      await this.sub.quit();
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
  if (!this.sub) return this;
  this.sub.subscribe(
    pattern,
    async (buffer) => {
      handleMessage.bind(this)(
        parseJsonBuffer(buffer),
        async ({ result, req }) => {
          await this.pub?.publish(
            pattern + "." + req.id,
            JSON.stringify(result)
          );
        },
        handler
      );
    },
    true
  );
  return this;
}
