import "@ipare/core";
import { Context, Startup } from "@ipare/core";
import { IService, parseInject } from "@ipare/inject";
import * as redis from "redis";
import { OPTIONS_IDENTITY } from "./constant";
import { Options } from "./options";

export type RedisConnection = redis.RedisClientType;

declare module "@ipare/core" {
  interface Startup {
    useRedis(options?: Options): this;
  }

  interface Context {
    getRedis(identity?: string): Promise<RedisConnection>;
  }
}

Startup.prototype.useRedis = function (options: Options = {}): Startup {
  const injectKey = OPTIONS_IDENTITY + (options.identity ?? "");

  return this.useInject().inject(
    injectKey,
    async () => {
      const client = redis.createClient(options);
      await client.connect();

      const disposedClient = client as IService & typeof client;
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

Context.prototype.getRedis = async function (
  identity?: string
): Promise<RedisConnection> {
  const injectKey = OPTIONS_IDENTITY + (identity ?? "");
  return (await parseInject(this, injectKey)) as RedisConnection;
};

export { redis };
export { RedisInject } from "./decorators";
export { Options } from "./options";
