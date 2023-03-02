import "@halsp/router";
import "@halsp/static";
import { normalizePath } from "@halsp/common";
import { HttpStartup } from "@halsp/http";
import { USED } from "./constant";
import { SwaggerOptions } from "./options";
import "./validator.decorator";
import { SwaggerMiddlware } from "./swagger.middleware";
import { getAbsoluteFSPath } from "swagger-ui-dist";
import { ArrayItemType } from "./parser/schema-dict";

declare module "@halsp/common" {
  interface Context {
    get swaggerOptions(): SwaggerOptions;
  }
}
declare module "@halsp/http" {
  interface HttpStartup {
    useSwagger(options?: SwaggerOptions): this;
  }
}

HttpStartup.prototype.useSwagger = function (options: SwaggerOptions = {}) {
  if (!!this[USED]) {
    return this;
  }
  this[USED] = true;

  const opt = {
    ...options,
    path: normalizePath(options.path ?? "swagger"),
    basePath: normalizePath(options.basePath ?? ""),
  };

  return this.use(async (ctx, next) => {
    Object.defineProperty(ctx, "swaggerOptions", {
      configurable: false,
      enumerable: false,
      get: () => {
        return opt;
      },
    });
    await next();
  })
    .add(() => new SwaggerMiddlware(opt))
    .useStatic({
      prefix: opt.path,
      dir: getAbsoluteFSPath(),
      useIndex: true,
      useExt: true,
    });
};

export { SwaggerOptions, ArrayItemType };
