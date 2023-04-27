import { MicroStartup } from "@halsp/micro";
import { MicroRedisOptions } from "./options";
import { Context, getHalspPort } from "@halsp/core";
import * as redis from "redis";
import { parseJsonBuffer } from "@halsp/micro-common";

export class MicroRedisStartup extends MicroStartup {
  constructor(protected readonly options: MicroRedisOptions = {}) {
    super();
  }

  #handlers: {
    pattern: string;
    handler?: (ctx: Context) => Promise<void> | void;
  }[] = [];

  protected pub?: redis.RedisClientType;
  protected sub?: redis.RedisClientType;

  async listen() {
    await this.close();

    const opt: MicroRedisOptions = { ...this.options };
    if (!("url" in opt)) {
      const port = getHalspPort(6379);
      opt.url = `redis://localhost:${port}`;
    }

    this.pub = redis.createClient(opt) as redis.RedisClientType;
    this.sub = redis.createClient(opt) as redis.RedisClientType;
    await Promise.all([this.pub.connect(), this.sub.connect()]);

    this.#handlers.forEach((item) => {
      this.#register(item.pattern, item.handler);
    });

    this.logger.info(`Server started, listening url: ${opt.url}`);
    return {
      sub: this.sub,
      pub: this.pub,
    };
  }

  #register(pattern: string, handler?: (ctx: Context) => Promise<void> | void) {
    if (!this.sub) return this;
    this.sub.subscribe(
      pattern,
      async (buffer) => {
        this.handleMessage(
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

  register(pattern: string, handler?: (ctx: Context) => Promise<void> | void) {
    this.logger.debug(`Add pattern: ${pattern}`);
    this.#handlers.push({ pattern, handler });
    return this.#register(pattern, handler);
  }

  async close() {
    await this.pub?.quit();
    this.pub = undefined;
    await this.sub?.quit();
    this.sub = undefined;

    this.logger.info("Server shutdown success");
  }
}
