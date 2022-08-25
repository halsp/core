import "@ipare/core";
import { HttpContext, Startup } from "@ipare/core";
import { InjectDisposable, parseInject } from "@ipare/inject";
import mongoose from "mongoose";
import { OPTIONS_IDENTITY } from "./constant";
import { Options } from "./options";

declare module "@ipare/core" {
  interface Startup {
    useMongoose(options: Options): this;
  }

  interface HttpContext {
    getMongoose(identity?: string): Promise<mongoose.Connection>;
  }
}

Startup.prototype.useMongoose = function (options: Options): Startup {
  const injectKey = OPTIONS_IDENTITY + (options.identity ?? "");

  return this.useInject().inject(
    injectKey,
    async () => {
      const connection = await mongoose.createConnection(options.url, options);
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

HttpContext.prototype.getMongoose = async function (
  identity?: string
): Promise<mongoose.Connection> {
  const injectKey = OPTIONS_IDENTITY + (identity ?? "");
  return (await parseInject(this, injectKey)) as mongoose.Connection;
};

export { mongoose };
export { MongoConnection } from "./decorators";
export { Options } from "./options";
