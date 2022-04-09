import "@sfajs/core";
import { Startup } from "@sfajs/core";
import swaggerJSDoc from "swagger-jsdoc";

interface SfaSwaggerConfig {
  url?: string;
  customHtml?:
    | ((jsonStr: string) => Promise<string>)
    | ((jsonStr: string) => string);
  options?: swaggerJSDoc.Options;
}

export { swaggerJSDoc, SfaSwaggerConfig };

declare module "@sfajs/core" {
  interface Startup {
    useSwagger(cfg?: SfaSwaggerConfig): this;
  }
}

Startup.prototype.useSwagger = function (cfg: SfaSwaggerConfig = {}): Startup {
  return this.use(async (ctx, next) => {
    if (fixPath(ctx.req.path) != fixPath(cfg.url)) {
      return await next();
    }
    const jsonStr = JSON.stringify(swaggerJSDoc(cfg.options ?? defaultOptions));
    let body;
    if (cfg.customHtml) {
      const html = cfg.customHtml(jsonStr);
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

const defaultOptions = {
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
