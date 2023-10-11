import "@halsp/inject";
import { Context, Startup } from "@halsp/core";
import { IService } from "@halsp/inject";
import path from "path";
import * as typeorm from "typeorm";
import { OPTIONS_IDENTITY } from "./constant";
import { Typeorm } from "./decorators";
import { Options } from "./options";

declare module "@halsp/core" {
  interface Startup {
    useTypeorm(options: Options): this;
  }

  interface Context {
    getTypeorm(identity?: string): Promise<Typeorm>;
  }
}

Startup.prototype.useTypeorm = function (options: Options): Startup {
  const injectKey = OPTIONS_IDENTITY + (options.identity ?? "");
  if (!options.entities) {
    options = Object.assign(
      {
        entities: [
          path.resolve(
            process.env.TS_JEST ? "entities/**/*.ts" : "entities/**/*.js",
          ),
          path.resolve(
            process.env.TS_JEST ? "entity/**/*.ts" : "entity/**/*.js",
          ),
        ],
      },
      options,
    );
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
    options.injectType,
  );
};

Context.prototype.getTypeorm = async function (
  identity?: string,
): Promise<Typeorm> {
  const injectKey = OPTIONS_IDENTITY + (identity ?? "");
  return (await this.getService<Typeorm>(injectKey))!;
};

export { Typeorm } from "./decorators";
export { Options } from "./options";
