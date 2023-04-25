import "@halsp/core";
import { Context, Startup } from "@halsp/core";
import { IService, parseInject } from "@halsp/inject";
import mongoose from "mongoose";
import { OPTIONS_IDENTITY } from "./constant";
import { Mongoose } from "./decorators";
import { Options } from "./options";

declare module "@halsp/core" {
  interface Startup {
    useMongoose(options: Options): this;
  }

  interface Context {
    getMongoose(identity?: string): Promise<Mongoose>;
  }
}

Startup.prototype.useMongoose = function (options: Options): Startup {
  const injectKey = OPTIONS_IDENTITY + (options.identity ?? "");

  return this.useInject().inject(
    injectKey,
    async () => {
      const opt = { ...options } as Partial<Options>;
      delete opt.url;
      delete opt.injectType;
      delete opt.identity;
      const connection = await mongoose.createConnection(options.url, opt);
      const disposedClient = connection as IService & typeof connection;
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

Context.prototype.getMongoose = async function (
  identity?: string
): Promise<Mongoose> {
  const injectKey = OPTIONS_IDENTITY + (identity ?? "");
  return (await parseInject(this, injectKey)) as Mongoose;
};

export { Mongoose } from "./decorators";
export { Options } from "./options";
