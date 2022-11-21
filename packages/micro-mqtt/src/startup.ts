import { MicroStartup } from "@ipare/micro";
import { MicroMqttOptions } from "./options";
import type mqtt from "mqtt";
import { Context } from "@ipare/core";
import { matchTopic } from "./topic";
import { parseJsonBuffer } from "@ipare/micro-common";

export class MicroMqttStartup extends MicroStartup {
  constructor(protected readonly options: MicroMqttOptions = {}) {
    super();
  }

  #handlers: {
    pattern: string;
    handler: (ctx: Context) => Promise<void> | void;
  }[] = [];

  protected client?: mqtt.MqttClient;
  private connectResolve?: (err: void) => void;

  async listen() {
    this.close(true);

    const opt: any = { ...this.options };
    delete opt.host;
    if (process.env.IPARE_DEBUG_PORT) {
      opt.port = Number(process.env.IPARE_DEBUG_PORT);
    } else {
      opt.port = this.options.port ?? 1883;
    }
    opt.services = this.options.host ?? "localhost";

    await new Promise<void>((resolve) => {
      this.connectResolve = resolve;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mqttPkg = require("mqtt");
      this.client = mqttPkg.connect(opt) as mqtt.MqttClient;
      this.client.on("connect", () => {
        resolve();
      });
      this.client.on("error", (err) => {
        this.logger.error(err);
        resolve();
      });
    });

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
          parseJsonBuffer(payload),
          async ({ result, req }) => {
            const reply = req.pattern + "/" + req.id;
            const json = JSON.stringify(result);
            if (this.options.publishOptions) {
              client.publish(reply, json, this.options.publishOptions);
            } else {
              client.publish(reply, json);
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

    this.logger.info(`Server started, listening port: ${opt.port}`);
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
    this.logger.debug(`Add pattern: ${pattern}`);
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

  async close(force?: boolean) {
    if (this.connectResolve) {
      this.connectResolve();
      this.connectResolve = undefined;
    }

    this.client?.end(force);
    this.client?.removeAllListeners();
    this.logger.info("Server shutdown success");
  }
}
