import "@ipare/core";
import { Startup } from "@ipare/core";
import {
  getTransientInstances,
  InjectType,
  tryParseInject,
} from "@ipare/inject";
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
  return this.useInject()
    .inject(
      injectKey,
      async () => {
        const dataSource = new typeorm.DataSource(options);
        if (options.initialize ?? true) {
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
          dataSource?.isInitialized && dataSource.destroy();
        } else if (options.injectType == InjectType.Transient) {
          getTransientInstances<typeorm.DataSource>(ctx, injectKey).forEach(
            (item) => item.isInitialized && item.destroy()
          );
        }
      }
    });
};

export { typeorm };
export { DataSource } from "./decorators";
export { Options } from "./options";
