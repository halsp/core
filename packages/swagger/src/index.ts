import "sfa";
import { Startup } from "sfa";
import swaggerJSDoc = require("swagger-jsdoc");

interface SfaSwaggerConfig {
  url?: string;
  customHtml?: string;
  options?: swaggerJSDoc.Options;
}

export { swaggerJSDoc, SfaSwaggerConfig };

declare module "sfa" {
  interface Startup {
    useSwagger<T extends this>(cfg?: SfaSwaggerConfig): T;
  }
}

Startup.prototype.useSwagger = function <T extends Startup>(
  cfg: SfaSwaggerConfig = {}
): T {
  return this.use(async (ctx, next) => {
    ctx.res.setHeader("sfa-swagger", "https://github.com/sfajs/swagger");

    if (fixPath(ctx.req.path) != fixPath(cfg.url)) {
      return await next();
    }

    if (ctx.req.params.type == "json") {
      ctx
        .ok(JSON.stringify(swaggerJSDoc(cfg.options ?? defaultOptions)))
        .setHeader("content-type", "application/json");
    } else {
      ctx.ok(cfg.customHtml ?? html).setHeader("content-type", "text/html");
    }
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

const html = `<!DOCTYPE html>
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
        url: window.location.href + '?type=json',
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
