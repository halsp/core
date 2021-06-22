# @sfajs/swagger

使用 swagger 自动生成你的 sfa 文档

基于 [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) 生成 `swagger` json 配置文件，下载到浏览器使用 [swagger-ui](https://github.com/swagger-api/swagger-ui) 渲染 UI

## 快速开始

使用中间件的默认配置

```TS
import { TestStartup } from "sfa";
import "@sfajs/swagger";

const res = await new TestStartup()
  .useSwagger()
  .useRouter()
  .run();
```

在 `@sfajs/router` 的路由文件夹 `controllers` 下 `Action` 文件中

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
export default class extends Action{
  async invoke(){
    this.ok("@sfajs/swagger");
  }
}
```

## 配置

`startup.useSwagger` 接收三个参数：

- swaggerJSDoc:
- url
- customHtml: 如果你想自定义 swagger 页面，可传入字符串以替换默认页面

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

默认内容：

```HTML
<!DOCTYPE html>
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
</html>
```

如果你想自定义 swagger 页面，可传入字符串以替换默认页面

但你需要注意，`SwaggerUIBundle` 参数 `url` 的应该是 `window.location.href + '?type=json'`
