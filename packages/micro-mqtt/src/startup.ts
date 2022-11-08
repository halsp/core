import { MicroStartup } from "@ipare/micro";
import { MicroMqttOptions } from "./options";
import { initMqttConnection, MicroMqttConnection } from "./connection";
import * as mqtt from "mqtt";
import { Context } from "@ipare/core";

export class MicroMqttStartup extends MicroStartup {
  constructor(protected readonly options: MicroMqttOptions = {}) {
    super();
    initMqttConnection.bind(this)();
  }

  #handlers: {
    pattern: string;
    handler: (ctx: Context) => Promise<void> | void;
  }[] = [];

  async listen() {
    await this.initClients();

    this.#handlers.forEach((item) => {
      this.#pattern(item.pattern);
    });

    const client = this.client as mqtt.MqttClient;
    client.on(
      "message",
      (topic: string, payload: Buffer, packet: mqtt.IPublishPacket) => {
        const handler = this.#handlers.filter((item) =>
          matchTopic(item.pattern, topic)
        )[0]?.handler;
        if (!handler) return;

        this.handleMessage(
          payload,
          async ({ result, req }) => {
            const pattern = this.prefix + req.pattern;
            const reply = pattern + "/" + req.id;
            if (this.options.publishOptions) {
              client.publish(reply, result, this.options.publishOptions);
            } else {
              client.publish(reply, result);
            }
          },
          async (ctx) => {
            Object.defineProperty(ctx.req, "packet", {
              configurable: true,
              enumerable: true,
              get: () => packet,
            });
            await handler(ctx);
          }
        );
      }
    );

    return client;
  }

  #pattern(pattern: string) {
    if (!this.client) return this;

    if (this.options.subscribeOptions) {
      this.client.subscribe(pattern, this.options.subscribeOptions);
    } else {
      this.client.subscribe(pattern);
    }

    return this;
  }

  pattern(pattern: string, handler: (ctx: Context) => Promise<void> | void) {
    pattern = this.prefix + pattern;
    this.#handlers.push({
      pattern: pattern,
      handler,
    });
    return this.#pattern(pattern);
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
export interface MicroMqttStartup
  extends MicroMqttConnection<MicroMqttOptions> {}

function matchTopic(filter: string, topic: string) {
  const filterArray = filter.split("/");
  const topicArray = topic.split("/");

  const length = filterArray.length;
  for (let i = 0; i < length; ++i) {
    const filterItem = filterArray[i];
    const topicItem = topicArray[i];
    if (filterItem === "#") {
      return topicArray.length >= length - 1;
    }
    if (filterItem !== "+" && filterItem !== topicItem) {
      return false;
    }
  }

  return length === topicArray.length;
}
