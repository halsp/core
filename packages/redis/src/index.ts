import "@halsp/core";
import "@halsp/inject";
import { Context, Startup } from "@halsp/core";
import { IService } from "@halsp/inject";
import * as redis from "redis";
import { OPTIONS_IDENTITY } from "./constant";
import { Redis } from "./decorators";
import { Options } from "./options";

declare module "@halsp/core" {
  interface Startup {
    useRedis(options?: Options): this;
  }

  interface Context {
    getRedis(identity?: string): Promise<Redis>;
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
): Promise<Redis> {
  const injectKey = OPTIONS_IDENTITY + (identity ?? "");
  return (await this.getService<Redis>(injectKey))!;
};

export { Redis } from "./decorators";
export { Options } from "./options";
