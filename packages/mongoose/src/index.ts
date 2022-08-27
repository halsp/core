import "@ipare/core";
import { HttpContext, Startup } from "@ipare/core";
import { IService, parseInject } from "@ipare/inject";
import mongoose from "mongoose";
import { OPTIONS_IDENTITY } from "./constant";
import { Options } from "./options";

export type MongooseConnection = mongoose.Connection;

declare module "@ipare/core" {
  interface Startup {
    useMongoose(options: Options): this;
  }

  interface HttpContext {
    getMongoose(identity?: string): Promise<MongooseConnection>;
  }
}

Startup.prototype.useMongoose = function (options: Options): Startup {
  const injectKey = OPTIONS_IDENTITY + (options.identity ?? "");

  return this.useInject().inject(
    injectKey,
    async () => {
      const connection = await mongoose.createConnection(options.url, options);
      const disposedClient = connection as IService & typeof connection;
      disposedClient.onDispose = async () => {
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
): Promise<MongooseConnection> {
  const injectKey = OPTIONS_IDENTITY + (identity ?? "");
  return (await parseInject(this, injectKey)) as MongooseConnection;
};

export { mongoose };
export { MongooseInject } from "./decorators";
export { Options } from "./options";
