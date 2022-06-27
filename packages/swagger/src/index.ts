import "@sfajs/core";
import "@sfajs/router";
import { isUndefined, Startup } from "@sfajs/core";
import { OpenApiBuilder } from "openapi3-ts";
import { USED } from "./constant";
import { Parser } from "./parser";
import { SwaggerOptions } from "./swagger-options";
import { getSwaggerBody } from "./swagger-body";

declare module "@sfajs/core" {
  interface Startup {
    useSwagger(options?: SwaggerOptions): this;
  }
}

Startup.prototype.useSwagger = function (options?: SwaggerOptions): Startup {
  if (!!this[USED]) {
    return this;
  }
  this[USED] = true;

  options = options ?? {};
  let openApiBuilder = new OpenApiBuilder();
  if (options?.builder) {
    openApiBuilder = options.builder(openApiBuilder);
  }

  let swaggerBody: string | undefined = undefined;
  return this.use(async (ctx, next) => {
    if (fixPath(ctx.req.path) != fixPath(options?.path ?? "")) {
      return await next();
    }

    if (isUndefined(swaggerBody)) {
      const doc = new Parser(
        this.routerMap,
        openApiBuilder,
        this.routerOptions
      ).parse();
      swaggerBody = await getSwaggerBody(doc, options as SwaggerOptions);
    }
    ctx.setHeader("content-type", "text/html").ok(swaggerBody);
  });
};

function fixPath(path?: string): string {
  return (path ?? "")
    .replace(/\\/g, "/")
    .replace("^/+", "")
    .replace(/\/+$/, "");
}

export { ApiTags, ApiSummary, PropertyDescription } from "./decorators";
export { beforeCompile } from "./before-compile";
