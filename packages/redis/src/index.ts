import "@ipare/core";
import { Startup } from "@ipare/core";
import { InjectDisposable } from "@ipare/inject";
import * as redis from "redis";
import { OPTIONS_IDENTITY } from "./constant";
import { Options } from "./options";

declare module "@ipare/core" {
  interface Startup {
    useRedis(options: Options): this;
  }
}

Startup.prototype.useRedis = function (options: Options): Startup {
  const injectKey = OPTIONS_IDENTITY + (options.identity ?? "");
  options.connect = options.connect ?? true;

  return this.useInject().inject(
    injectKey,
    async () => {
      const client = redis.createClient(options);
      if (options.connect) {
        await client.connect();
      }

      const disposedClient = client as InjectDisposable & typeof client;
      disposedClient.dispose = async () => {
        if (disposedClient.isOpen) {
          disposedClient.disconnect();
        }
      };

      return client;
    },
    options.injectType
  );
};

export { redis };
export { RedisClient } from "./decorators";
export { Options } from "./options";
