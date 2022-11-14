import { Context, ObjectConstructor, Startup } from "@ipare/core";
import { InjectType, parseInject } from "@ipare/inject";
import { MICRO_IDENTITY_KEY } from "./constant";
import {
  MicroMqttClient,
  MicroMqttClientOptions,
  MicroNatsClient,
  MicroNatsClientOptions,
  MicroRedisClient,
  MicroRedisClientOptions,
  MicroTcpClient,
  MicroTcpClientOptions,
} from "./clients";

export { MicroClient } from "./decorators";

export {
  IMicroClient,
  MicroMqttClient,
  MicroMqttClientOptions,
  MicroNatsClient,
  MicroNatsClientOptions,
  MicroRedisClient,
  MicroRedisClientOptions,
  MicroTcpClient,
  MicroTcpClientOptions,
} from "./clients";

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
    const injectKey = MICRO_IDENTITY_KEY + (options.identity ?? "");
    return this.useInject().inject(
      injectKey,
      async () => {
        const opts = { ...options } as InjectMicroClient;
        delete opts.identity;
        delete opts.injectType;

        const client = new clientConstructor(opts);
        Object.defineProperty(client, "logger", {
          configurable: true,
          enumerable: false,
          get: () => this.logger,
          set: (val) => {
            this.logger = val;
          },
        });
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
  const injectKey = MICRO_IDENTITY_KEY + (identity ?? "");
  return await parseInject(this, injectKey);
};
