import { isUndefined, Startup } from "@sfajs/core";
import { OpenApiBuilder } from "openapi3-ts";
import { Parser } from "./parser";
import { getSwaggerBody } from "./swagger-body";
import { SwaggerOptions } from "./swagger-options";

export function useSetup<T extends Startup>(
  startup: T,
  options: SwaggerOptions
): T {
  let openApiBuilder = new OpenApiBuilder();
  if (options.builder) {
    openApiBuilder = options.builder(openApiBuilder);
  }

  let swaggerBody: string | undefined = undefined;
  return startup.use(async (ctx, next) => {
    if (fixPath(ctx.req.path) != fixPath(options.path ?? "")) {
      return await next();
    }

    if (isUndefined(swaggerBody)) {
      const doc = new Parser(
        startup.routerMap,
        openApiBuilder,
        startup.routerOptions,
        options
      ).parse();
      swaggerBody = await getSwaggerBody(doc, options);
    }
    ctx.setHeader("content-type", "text/html").ok(swaggerBody);
  });
}

function fixPath(path?: string): string {
  return (path ?? "")
    .replace(/\\/g, "/")
    .replace("^/+", "")
    .replace(/\/+$/, "");
}
