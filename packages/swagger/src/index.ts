import "@halsp/router";
import "@halsp/static";
import "@halsp/http";
import { normalizePath, Startup } from "@halsp/core";
import { SwaggerOptions } from "./options";
import "./validator.decorator";
import { SwaggerMiddlware } from "./swagger.middleware";
import { getAbsoluteFSPath } from "swagger-ui-dist";
import { ArrayItemType } from "./parser/schema-dict";

declare module "@halsp/core" {
  interface Context {
    get swaggerOptions(): SwaggerOptions;
  }
  interface Startup {
    useSwagger(options?: SwaggerOptions): this;
  }
}

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useSwagger = function (options: SwaggerOptions = {}) {
  if (usedMap.get(this)) return this;
  usedMap.set(this, true);

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

export { V } from "@halsp/validator";
