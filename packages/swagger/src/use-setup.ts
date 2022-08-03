import { isUndefined, Startup } from "@ipare/core";
import { OpenApiBuilder } from "openapi3-ts";
import { Parser } from "./parser";
import { getSwaggerBody } from "./swagger-body";
import { SwaggerOptions } from "./swagger-options";

export function useSetup<T extends Startup>(
  startup: T,
  options: SwaggerOptions
): T {
  let swaggerBody: string | undefined = undefined;
  return startup
    .use(async (ctx, next) => {
      Object.defineProperty(ctx, "swaggerOptions", {
        configurable: false,
        enumerable: false,
        get: () => {
          return options;
        },
      });
      await next();
    })
    .use(async (ctx, next) => {
      if (fixPath(ctx.req.path) != fixPath(options.path)) {
        return await next();
      }

      if (isUndefined(swaggerBody)) {
        let openApiBuilder = new OpenApiBuilder().addInfo({
          title: "@ipare/swagger",
          version: "0.0.1",
        });
        if (options.builder) {
          openApiBuilder = options.builder(openApiBuilder);
        }

        const doc = new Parser(
          startup.routerMap,
          openApiBuilder,
          startup.routerOptions
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
