import "@ipare/core";
import { Startup } from "@ipare/core";
import {
  getTransientInstances,
  InjectType,
  tryParseInject,
} from "@ipare/inject";
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
  options.initialize = options.initialize ?? true;
  if (!options.entities) {
    options = Object.assign(options, {
      entities: [
        path.join(
          process.cwd(),
          process.env.TS_JEST ? "entities/*.ts" : "entities/*.js"
        ),
      ],
    });
  }

  return this.useInject()
    .inject(
      injectKey,
      async () => {
        const dataSource = new typeorm.DataSource(options);
        if (options.initialize) {
          await dataSource.initialize();
        }
        return dataSource;
      },
      options.injectType
    )
    .use(async (ctx, next) => {
      try {
        await next();
      } finally {
        if (!options.injectType || options.injectType == InjectType.Scoped) {
          const dataSource = tryParseInject<typeorm.DataSource>(ctx, injectKey);
          dataSource?.isInitialized && (await dataSource.destroy());
        } else if (options.injectType == InjectType.Transient) {
          const instances = getTransientInstances<typeorm.DataSource>(
            ctx,
            injectKey
          );
          for (const instance of instances) {
            instance.isInitialized && (await instance.destroy());
          }
        }
      }
    });
};

export { typeorm };
export { DataSource } from "./decorators";
export { Options } from "./options";
