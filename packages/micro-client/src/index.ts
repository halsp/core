import { Context, ObjectConstructor, Startup } from "@ipare/core";
import { InjectType, parseInject } from "@ipare/inject";
import { MicroIdentityKey } from "./constant";
import { MicroMqttClient, MicroMqttClientOptions } from "./mqtt";
import { MicroNatsClient, MicroNatsClientOptions } from "./nats";
import { MicroRedisClient, MicroRedisClientOptions } from "./redis";
import { MicroTcpClient, MicroTcpClientOptions } from "./tcp";

export { MicroBaseClient } from "./base";
export { MicroClient } from "./decorators";
export { MicroTcpClient, MicroTcpClientOptions } from "./tcp";
export { MicroRedisClient, MicroRedisClientOptions } from "./redis";
export { MicroNatsClient, MicroNatsClientOptions } from "./nats";
export { MicroMqttClient, MicroMqttClientOptions } from "./mqtt";

declare module "@ipare/core" {
  interface Startup {
    useMicroRedis(options?: MicroRedisClientOptions & InjectMicroClient): this;
    useMicroMqtt(options?: MicroMqttClientOptions & InjectMicroClient): this;
    useMicroTcp(options?: MicroTcpClientOptions & InjectMicroClient): this;
    useMicroNats(options?: MicroNatsClientOptions & InjectMicroClient): this;
  }

  interface Context {
    getMicroClient<T = any>(identity?: string): Promise<T>;
  }
}

type InjectMicroClient = {
  identity?: string;
  injectType?: InjectType;
};

function initFunctions(fnName: string, clientConstructor: ObjectConstructor) {
  Startup.prototype[fnName] = function (
    options: InjectMicroClient = {}
  ): Startup {
    const injectKey = MicroIdentityKey + (options.identity ?? "");
    return this.useInject().inject(
      injectKey,
      async (ctx) => {
        const opts = { ...options } as InjectMicroClient;
        delete opts.identity;
        delete opts.injectType;

        const client = new clientConstructor(opts);
        Object.defineProperty(client, "logger", {
          get: () => this.logger,
          set: (val) => {
            this.logger = val;
          },
        });
        client.logger = ctx.logger;
        await client.connect();
        return client;
      },
      options.injectType ?? InjectType.Singleton
    );
  };
}

initFunctions("useMicroRedis", MicroRedisClient);
initFunctions("useMicroMqtt", MicroMqttClient);
initFunctions("useMicroTcp", MicroTcpClient);
initFunctions("useMicroNats", MicroNatsClient);

Context.prototype.getMicroClient = async function (
  identity?: string
): Promise<any> {
  const injectKey = MicroIdentityKey + (identity ?? "");
  return await parseInject(this, injectKey);
};
