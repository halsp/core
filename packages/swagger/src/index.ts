import "@sfajs/core";
import { isUndefined, Startup } from "@sfajs/core";
import { OpenApiBuilder, OpenAPIObject } from "openapi3-ts";
import { USED } from "./constant";
import { Parser } from "./parser";

type SwaggerBuilder = (builder: OpenApiBuilder) => OpenApiBuilder;

export interface SwaggerOptions {
  path?: string;
  builder?: SwaggerBuilder;
  customHtml?:
    | ((jsonStr: string) => Promise<string>)
    | ((jsonStr: string) => string);
}

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
  const doc = new Parser(openApiBuilder).parse();

  let body: string | undefined = undefined;

  return this.use(async (ctx, next) => {
    if (fixPath(ctx.req.path) != fixPath(options?.path ?? "")) {
      return await next();
    }

    if (isUndefined(body)) {
      body = await getSwaggerBody(doc, options as SwaggerOptions);
    }
    ctx.setHeader("content-type", "text/html").ok(body);
  });
};

async function getSwaggerBody(doc: OpenAPIObject, options: SwaggerOptions) {
  const docStr = JSON.stringify(doc);
  let body: string;
  if (options.customHtml) {
    body = await options.customHtml(docStr);
  } else {
    body = getHtml(docStr);
  }
  return body;
}

function fixPath(path?: string): string {
  return (path ?? "")
    .replace(/\\/g, "/")
    .replace("^/+", "")
    .replace(/\/+$/, "");
}

const getHtml = (jsonStr: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.50.0/swagger-ui.min.css" />
    <style>
      html
      {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: auth;
      }

      *,
      *:before,
      *:after
      {
        box-sizing: inherit;
      }

      body
      {
        margin:0;
        background: #fafafa;
      }
    </style>
  </head>

  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.50.0/swagger-ui-bundle.min.js" charset="UTF-8"> </script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.50.0/swagger-ui-standalone-preset.min.js" charset="UTF-8"> </script>
    <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        spec: ${jsonStr},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        validatorUrl:null
      });
      window.ui = ui;
    };
  </script>
  </body>
</html>`;
