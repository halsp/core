import "@halsp/common";
import { Context, Startup } from "@halsp/common";
import { IService, parseInject } from "@halsp/inject";
import * as knex from "knex";
import { OPTIONS_IDENTITY } from "./constant";
import { Options } from "./options";

declare module "@halsp/common" {
  interface Startup {
    useKnex(options: Options): this;
  }

  interface Context {
    getKnex(identity?: string): Promise<knex.Knex>;
  }
}

Startup.prototype.useKnex = function (options: Options): Startup {
  const injectKey = OPTIONS_IDENTITY + (options.identity ?? "");

  return this.useInject().inject(
    injectKey,
    async () => {
      const opt = { ...options } as Partial<Options>;
      delete opt.injectType;
      delete opt.identity;
      const connection = knex.knex(options);
      const disposedClient = connection as IService & typeof connection;
      disposedClient.dispose = async () => {
        await connection.destroy();
      };
      return connection;
    },
    options.injectType
  );
};

Context.prototype.getKnex = async function (
  identity?: string
): Promise<knex.Knex> {
  const injectKey = OPTIONS_IDENTITY + (identity ?? "");
  return (await parseInject<knex.Knex>(this, injectKey)) as knex.Knex;
};

export { knex };
export { Knex } from "./decorators";
export { Options } from "./options";
