import "@halsp/common";
import { Context, Startup } from "@halsp/common";
import { IService, parseInject } from "@halsp/inject";
import path from "path";
import * as typeorm from "typeorm";
import { OPTIONS_IDENTITY } from "./constant";
import { Options } from "./options";

export type TypeormConnection = typeorm.DataSource;

declare module "@halsp/common" {
  interface Startup {
    useTypeorm(options: Options): this;
  }

  interface Context {
    getTypeorm(identity?: string): Promise<TypeormConnection>;
  }
}

Startup.prototype.useTypeorm = function (options: Options): Startup {
  const injectKey = OPTIONS_IDENTITY + (options.identity ?? "");
  if (!options.entities) {
    options = Object.assign(options, {
      entities: [
        path.join(
          process.cwd(),
          process.env.TS_JEST ? "entities/**/*.ts" : "entities/**/*.js"
        ),
        path.join(
          process.cwd(),
          process.env.TS_JEST ? "entity/**/*.ts" : "entity/**/*.js"
        ),
      ],
    });
  }

  return this.useInject().inject(
    injectKey,
    async () => {
      const dataSource = new typeorm.DataSource(options) as IService &
        typeorm.DataSource;
      await dataSource.initialize();

      dataSource.dispose = async () => {
        if (dataSource.isInitialized) {
          await dataSource.destroy();
        }
      };

      return dataSource;
    },
    options.injectType
  );
};

Context.prototype.getTypeorm = async function (
  identity?: string
): Promise<TypeormConnection> {
  const injectKey = OPTIONS_IDENTITY + (identity ?? "");
  return (await parseInject(this, injectKey)) as TypeormConnection;
};

export { typeorm };
export { Typeorm } from "./decorators";
export { Options } from "./options";
