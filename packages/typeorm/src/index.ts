import "@ipare/core";
import { Startup } from "@ipare/core";
import { InjectDisposable } from "@ipare/inject";
import path from "path";
import * as typeorm from "typeorm";
import { OPTIONS_IDENTITY } from "./constant";
import { Options } from "./options";

declare module "@ipare/core" {
  interface Startup {
    useTypeorm(options: Options): this;
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

export { typeorm };
export { DataSource } from "./decorators";
export { Options } from "./options";
