import "@ipare/core";
import { HttpContext, Startup } from "@ipare/core";
import { InjectDisposable, parseInject } from "@ipare/inject";
import path from "path";
import * as typeorm from "typeorm";
import { OPTIONS_IDENTITY } from "./constant";
import { Options } from "./options";

export type TypeormConnection = typeorm.DataSource;

declare module "@ipare/core" {
  interface Startup {
    useTypeorm(options: Options): this;
  }

  interface HttpContext {
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
      const dataSource = new typeorm.DataSource(options) as InjectDisposable &
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

HttpContext.prototype.getTypeorm = async function (
  identity?: string
): Promise<TypeormConnection> {
  const injectKey = OPTIONS_IDENTITY + (identity ?? "");
  return (await parseInject(this, injectKey)) as TypeormConnection;
};

export { typeorm };
export { TypeormInject } from "./decorators";
export { Options } from "./options";
