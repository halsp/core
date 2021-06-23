# @sfajs/swagger

使用 swagger 自动生成你的 sfa 文档

基于 [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) 生成页面，在浏览器中使用 [swagger-ui](https://github.com/swagger-api/swagger-ui) 渲染 UI

## 快速开始

使用中间件的默认配置

```TS
import { TestStartup } from "sfa";
import "@sfajs/swagger";

const res = await new TestStartup()
  .useSwagger()
  .run();

console.log(res.body); // html
```

在项目下任意 `.js`/`.ts` 文件中

```TS
/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to @sfajs/swagger!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
```

## 配置

`startup.useSwagger` 接收三个参数：

- swaggerJSDoc
- url
- customHtml

### swaggerJSDoc

参考 [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) 的 `options` 参数

默认值：

```JSON
{
  "definition": {
    "swagger": "2.0",
    "info": {
      "title": "Test",
      "version": "1.0.0",
    },
  },
  "apis": ["./*.ts", "./*.js"],
}
```

一般你需要替换默认值

### url

访问 swagger 页面的路径，默认为 `/`

### customHtml

如果你想自定义 swagger 页面，需要传入一个函数。函数入参为 json 字符串，返回值为 html 字符串或 `Promise<string>`

但你需要注意，`SwaggerUIBundle` 参数 `spec` 的应该是传入的字符串，如：

```TS
startup.useSwagger({
  customHtml: getHtml,
});

const getHtml = (jsonStr) => `<!DOCTYPE html>
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
```

上述 `getHtml` 为 `@sfajs/swagger` 的默认实现
