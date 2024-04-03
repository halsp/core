import { MicroMqttOptions } from "../options";
import * as mqtt from "mqtt";
import { getHalspPort, Startup } from "@halsp/core";
import { matchTopic } from "./topic";
import { parseJsonBuffer } from "@halsp/micro";
import { handleMessage } from "@halsp/micro/server";

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useMicroMqtt = function (options?: MicroMqttOptions) {
  if (usedMap.get(this)) {
    return this;
  }
  usedMap.set(this, true);

  initStartup.call(this, options);

  return this.useMicro();
};

function initStartup(this: Startup, options: MicroMqttOptions = {}) {
  let client: mqtt.MqttClient | undefined = undefined;

  let connectResolve: ((err: void) => void) | undefined = undefined;
  const closeInner = async () => {
    if (connectResolve) {
      connectResolve();
      connectResolve = undefined;
    }

    await close.call(this, client);
  };

  this.extend("listen", async () => {
    await closeInner();

    const opt: MicroMqttOptions = { ...options };
    if (!("servers" in options) && !("port" in options)) {
      opt.port = getHalspPort(1883);
    }

    client = mqtt.connect(opt) as mqtt.MqttClient;
    await new Promise<void>((resolve, reject) => {
      connectResolve = resolve;

      let handled = false;
      const handler = (cb: () => void) => {
        if (handled) return;
        handled = true;
        cb();
      };
      client!.on("connect", () => {
        handler(() => resolve());
      });
      client!.on("error", (err) => {
        handler(() => reject(err));
      });
    });

    this.registers.forEach((item) => {
      register.bind(this)(item.pattern, opt, client);
    });

    client.on(
      "message",
      (topic: string, payload: Buffer, packet: mqtt.IPublishPacket) => {
        const handler = this.registers.filter((item) =>
          matchTopic(item.pattern, topic),
        )[0];
        if (!handler) return;

        handleMessage.bind(this)(
          parseJsonBuffer(payload),
          async ({ result, req }) => {
            const reply = req.pattern + "/" + req.id;
            const json = JSON.stringify(result);
            if (options.publishOptions) {
              client!.publish(reply, json, options.publishOptions);
            } else {
              client!.publish(reply, json);
            }
          },
          async (ctx) => {
            Object.defineProperty(ctx.req, "packet", {
              configurable: true,
              enumerable: true,
              get: () => packet,
            });
            handler.handler && (await handler.handler(ctx));
          },
        );
      },
    );

    this.logger.info(`Server started, listening port: ${opt.port}`);
    return client;
  })
    .extend("close", async () => {
      await closeInner();
      this.logger.info("Server shutdown success");
    })
    .extend("register", (pattern: string) => {
      this.logger.debug(`Add pattern: ${pattern}`);
      return register.bind(this)(pattern, options, client);
    });
}

async function close(this: Startup, client?: mqtt.MqttClient) {
  if (!client) return;
  client.removeAllListeners();

  let shutdownTimeout = false;
  await new Promise<void>((resolve, reject) => {
    const forceShutdown = () => {
      client!.end(true, {}, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    };

    const shutdownTimer = setTimeout(() => {
      shutdownTimeout = true;
      this.logger.error(
        `Server shutdown timeout and will invoke force shutdown`,
      );
      forceShutdown();
    }, 2000);

    client!.end(false, {}, (err) => {
      clearTimeout(shutdownTimer);
      if (shutdownTimeout) return;

      if (err) {
        this.logger.error(
          `Server shutdown error and will invoke force shutdown, err = ${err.message}`,
        );
        forceShutdown();
      } else {
        resolve();
      }
    });
  });
}

function register(
  this: Startup,
  pattern: string,
  options: MicroMqttOptions,
  client?: mqtt.MqttClient,
) {
  if (!client) return this;

  if (options.subscribeOptions) {
    client.subscribe(pattern, options.subscribeOptions);
  } else {
    client.subscribe(pattern);
  }

  return this;
}
