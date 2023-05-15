import "@halsp/micro";
import { MicroMqttOptions } from "./options";
import mqtt from "mqtt";
import { Context, getHalspPort, Startup } from "@halsp/core";
import { matchTopic } from "./topic";
import { parseJsonBuffer } from "@halsp/micro-common";
import { handleMessage } from "@halsp/micro";

declare module "@halsp/core" {
  interface Startup {
    useMicroMqtt(options?: MicroMqttOptions): this;
    get client(): mqtt.MqttClient;

    listen(): Promise<mqtt.MqttClient>;
    close(): Promise<void>;

    register(
      pattern: string,
      handler?: (ctx: Context) => Promise<void> | void
    ): this;
  }
}

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
  const handlers: {
    pattern: string;
    handler?: (ctx: Context) => Promise<void> | void;
  }[] = [];

  let connectResolve: ((err: void) => void) | undefined = undefined;
  const closeInner = async () => {
    if (connectResolve) {
      connectResolve();
      connectResolve = undefined;
    }

    await close.call(this);
  };

  this.extend("listen", async () => {
    await closeInner();

    const opt: MicroMqttOptions = { ...options };
    if (!("servers" in options) && !("port" in options)) {
      opt.port = getHalspPort(1883);
    }

    await new Promise<void>((resolve, reject) => {
      connectResolve = resolve;
      const client = mqtt.connect(opt) as mqtt.MqttClient;
      Object.defineProperty(this, "client", {
        configurable: true,
        enumerable: true,
        get: () => client,
      });

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

    handlers.forEach((item) => {
      register.bind(this)(item.pattern, opt);
    });

    const client = this.client as mqtt.MqttClient;
    client.on(
      "message",
      (topic: string, payload: Buffer, packet: mqtt.IPublishPacket) => {
        const handler = handlers.filter((item) =>
          matchTopic(item.pattern, topic)
        )[0];
        if (!handler) return;

        handleMessage.bind(this)(
          parseJsonBuffer(payload),
          async ({ result, req }) => {
            const reply = req.pattern + "/" + req.id;
            const json = JSON.stringify(result);
            if (options.publishOptions) {
              client.publish(reply, json, options.publishOptions);
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
            handler.handler && (await handler.handler(ctx));
          }
        );
      }
    );

    this.logger.info(`Server started, listening port: ${opt.port}`);
    return client;
  })
    .extend("close", async () => {
      await closeInner();
      this.logger.info("Server shutdown success");
    })
    .extend(
      "register",
      (pattern: string, handler?: (ctx: Context) => Promise<void> | void) => {
        this.logger.debug(`Add pattern: ${pattern}`);
        handlers.push({ pattern, handler });
        return register.bind(this)(pattern, options);
      }
    );
}

async function close(this: Startup) {
  if (!this.client) return;
  const client = this.client;
  client.removeAllListeners();

  let shutdownTimeout = false;
  await new Promise<void>((resolve, reject) => {
    const forceShutdown = () => {
      client.end(true, {}, (err) => {
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
        `Server shutdown timeout and will invoke force shutdown`
      );
      forceShutdown();
    }, 2000);

    client.end(false, {}, (err) => {
      clearTimeout(shutdownTimer);
      if (shutdownTimeout) return;

      if (err) {
        this.logger.error(
          `Server shutdown error and will invoke force shutdown, err = ${err.message}`
        );
        forceShutdown();
      } else {
        resolve();
      }
    });
  });
}

function register(this: Startup, pattern: string, options: MicroMqttOptions) {
  if (!this.client) return this;

  if (options.subscribeOptions) {
    this.client.subscribe(pattern, options.subscribeOptions);
  } else {
    this.client.subscribe(pattern);
  }

  return this;
}
