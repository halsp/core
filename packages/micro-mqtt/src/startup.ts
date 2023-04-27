import { MicroStartup } from "@halsp/micro";
import { MicroMqttOptions } from "./options";
import mqtt from "mqtt";
import { Context, getHalspPort } from "@halsp/core";
import { matchTopic } from "./topic";
import { parseJsonBuffer } from "@halsp/micro-common";

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

    const opt: MicroMqttOptions = { ...this.options };
    if (!("servers" in this.options) && !("port" in this.options)) {
      opt.port = getHalspPort(1883);
    }

    await new Promise<void>((resolve, reject) => {
      this.connectResolve = resolve;
      this.client = mqtt.connect(opt) as mqtt.MqttClient;

      let handled = false;
      const handler = (cb: () => void) => {
        if (handled) return;
        handled = true;
        cb();
      };
      this.client.on("connect", () => {
        handler(() => resolve());
      });
      this.client.on("error", (err) => {
        handler(() => reject(err));
      });
    });

    this.#handlers.forEach((item) => {
      this.#register(item.pattern);
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

  #register(pattern: string) {
    if (!this.client) return this;

    if (this.options.subscribeOptions) {
      this.client.subscribe(pattern, this.options.subscribeOptions);
    } else {
      this.client.subscribe(pattern);
    }

    return this;
  }

  register(pattern: string, handler: (ctx: Context) => Promise<void> | void) {
    this.logger.debug(`Add pattern: ${pattern}`);
    this.#handlers.push({
      pattern: pattern,
      handler,
    });
    return this.#register(pattern);
  }

  async close(force?: boolean) {
    if (this.connectResolve) {
      this.connectResolve();
      this.connectResolve = undefined;
    }

    if (this.client) {
      const client = this.client;
      client.removeAllListeners();
      await new Promise<void>((resolve, reject) => {
        client.end(force, {}, (err) => {
          if (err) {
            reject(err);
          } else {
            this.logger.info("Server shutdown success");
            resolve();
          }
        });
      });
    }
  }
}
