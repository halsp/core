import "@ipare/core";
import { Startup } from "@ipare/core";
import { InjectDisposable } from "@ipare/inject";
import mongoose from "mongoose";
import { OPTIONS_IDENTITY } from "./constant";
import { Options } from "./options";

declare module "@ipare/core" {
  interface Startup {
    useMongoose(url: string, options?: Options): this;
  }
}

Startup.prototype.useMongoose = function (
  url: string,
  options: Options = {}
): Startup {
  const injectKey = OPTIONS_IDENTITY + (options.identity ?? "");

  return this.useInject().inject(
    injectKey,
    async () => {
      const connection = await mongoose.createConnection(url, options);
      const disposedClient = connection as InjectDisposable & typeof connection;
      disposedClient.dispose = async () => {
        if (
          disposedClient.readyState == mongoose.ConnectionStates.connected ||
          disposedClient.readyState == mongoose.ConnectionStates.connecting
        ) {
          await disposedClient.destroy();
        }
      };
      return connection;
    },
    options.injectType
  );
};

export { mongoose };
export { MongoConnection } from "./decorators";
export { Options } from "./options";
