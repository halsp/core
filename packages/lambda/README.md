# @sfajs/cloudbase

Hosting sfa in cloudbase

## 安装

npm i @sfajs/cloudbase

## 开始使用

```JS
const SfaCloudbase = require("@sfajs/cloudbase");
exports.main = async (event, context) => {
  return await new SfaCloudbase(event, context)
    .use(async (ctx, next) => {
      ctx.res.headers.demo = "@sfajs/cloudbase";
      await next();
    })
    .run();
};
```

如果添加 `@sfajs/router`

```JS
const SfaCloudbase = require("@sfajs/cloudbase");
require("@sfajs/router");
exports.main = async (event, context) => {
  return await new SfaCloudbase(event, context)
    .use(async (ctx, next) => {
      ctx.res.headers.demo = "@sfajs/cloudbase";
      await next();
    })
    .useRouter()
    .run();
};
```

## 简单 demo

项目 demo 目录下有个简单 demo
