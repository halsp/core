import "@ipare/core";
import "@ipare/router";
import "@ipare/static";
import { normalizePath, Startup } from "@ipare/core";
import { USED } from "./constant";
import { SwaggerOptions } from "./options";
import "./validator.decorator";
import { SwaggerMiddlware } from "./swagger.middleware";
import { getAbsoluteFSPath } from "swagger-ui-dist";
import { ArrayItemType } from "./parser/schema-dict";

declare module "@ipare/core" {
  interface Startup {
    useSwagger(options?: SwaggerOptions): this;
  }
  interface HttpContext {
    get swaggerOptions(): SwaggerOptions;
  }
}

Startup.prototype.useSwagger = function (
  options: SwaggerOptions = {}
): Startup {
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
      encoding: "utf-8",
      fileIndex: true,
    });
};

export { SwaggerOptions, ArrayItemType };
