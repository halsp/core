import "@ipare/core";
import { HttpContext, Startup } from "@ipare/core";
import { InjectDisposable, parseInject } from "@ipare/inject";
import * as redis from "redis";
import { OPTIONS_IDENTITY } from "./constant";
import { Options } from "./options";

declare module "@ipare/core" {
  interface Startup {
    useRedis(options?: Options): this;
  }

  interface HttpContext {
    getRedis(identity?: string): Promise<redis.RedisClientType>;
  }
}

Startup.prototype.useRedis = function (options: Options = {}): Startup {
  const injectKey = OPTIONS_IDENTITY + (options.identity ?? "");

  return this.useInject().inject(
    injectKey,
    async () => {
      const client = redis.createClient(options);
      await client.connect();

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

HttpContext.prototype.getRedis = async function (
  identity?: string
): Promise<redis.RedisClientType> {
  const injectKey = OPTIONS_IDENTITY + (identity ?? "");
  return (await parseInject(this, injectKey)) as redis.RedisClientType;
};

export { redis };
export { RedisClient } from "./decorators";
export { Options } from "./options";
