import "@ipare/core";
import "@ipare/router";
import "@ipare/static";
import { normalizePath, Startup } from "@ipare/core";
import { USED } from "./constant";
import { SwaggerOptions } from "./swagger-options";
import "./validator.decorator";
import { SwaggerMiddlware } from "./swagger.middleware";
import { getAbsoluteFSPath } from "swagger-ui-dist";

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

export { S } from "./validator.decorator";
