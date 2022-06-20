import "@sfajs/core";
import { Startup } from "@sfajs/core";
import swaggerJSDoc from "swagger-jsdoc";

export interface SwaggerOptions {
  url?: string;
  customHtml?:
    | ((jsonStr: string) => Promise<string>)
    | ((jsonStr: string) => string);
  docOptions?: swaggerJSDoc.Options;
}

export { swaggerJSDoc };

declare module "@sfajs/core" {
  interface Startup {
    useSwagger(options?: SwaggerOptions): this;
  }
}

Startup.prototype.useSwagger = function (
  options: SwaggerOptions = {}
): Startup {
  return this.use(async (ctx, next) => {
    if (fixPath(ctx.req.path) != fixPath(options.url)) {
      return await next();
    }
    const jsonStr = JSON.stringify(
      swaggerJSDoc(options.docOptions ?? defaultDocOptions)
    );
    let body;
    if (options.customHtml) {
      const html = options.customHtml(jsonStr);
      if (html instanceof Promise) {
        body = await html;
      } else {
        body = html;
      }
    } else {
      body = getHtml(jsonStr);
    }
    ctx.ok(body).setHeader("content-type", "text/html");
  });
};

const defaultDocOptions = {
  definition: {
    swagger: "2.0",
    info: {
      title: "Test",
      version: "1.0.0",
    },
  },
  apis: ["./*.ts", "./*.js"],
};

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
