import { composePattern, MicroStartup } from "@ipare/micro";
import { MicroNatsOptions } from "./options";
import { initNatsConnection, MicroNatsConnection } from "./connection";
import { Context } from "@ipare/core";

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
      this.pattern(item.pattern, item.handler);
    });

    return this.connection;
  }

  #pattern(pattern: string, handler: (ctx: Context) => Promise<void> | void) {
    if (!this.connection) return this;

    this.connection.subscribe(this.prefix + composePattern(pattern), {
      callback: (err, msg) => {
        this.handleMessage(
          Buffer.from(msg.data),
          async ({ result }) => {
            if (msg.reply) {
              msg.respond(Buffer.from(result, "utf-8"));
            }
          },
          handler
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
