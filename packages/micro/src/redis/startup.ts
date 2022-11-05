import { MicroStartup } from "../";
import { MicroRedisOptions } from "./options";
import { initRedisConnection, RedisConnection } from "./connection";
import { Context } from "@ipare/core";

export class MicroRedisStartup extends MicroStartup {
  constructor(options: MicroRedisOptions = {}) {
    super();
    initRedisConnection.bind(this)(options);
  }

  #handlers: {
    pattern: string;
    handler: (ctx: Context) => Promise<void> | void;
  }[] = [];

  async listen() {
    await this.initClients();

    const pub = this.pub as Exclude<typeof this.pub, undefined>;
    const sub = this.sub as Exclude<typeof this.pub, undefined>;

    this.#handlers.forEach((item) => {
      this.pattern(item.pattern, item.handler);
    });

    return { sub, pub };
  }

  #pattern(pattern: string, handler: (ctx: Context) => Promise<void> | void) {
    if (!this.sub) return this;
    this.sub.subscribe(
      pattern,
      async (buffer) => {
        this.handleMessage(
          buffer,
          async ({ result }) => {
            await this.pub?.publish(pattern + ".reply", result);
          },
          handler
        );
      },
      true
    );
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
export interface MicroRedisStartup extends RedisConnection {}
