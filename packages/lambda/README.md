# @sfajs/cloudbase

将 sfa 托管到腾讯云 CloudBase

## 安装

npm i @sfajs/cloudbase

## 开始使用

```TS
import SfaCloudbase from "@sfajs/cloudbase";

const main = async (event, context) => {
  return await new SfaCloudbase(event, context)
    .use(async (ctx, next) => {
      ctx.res.headers.demo = "@sfajs/cloudbase";
      await next();
    })
    .run();
};
exports.main = main;
```

如果添加 `@sfajs/router`

```JS
import SfaCloudbase from "@sfajs/cloudbase";
import "@sfajs/router";

const main = async (event, context) => {
  return await new SfaCloudbase(event, context)
    .use(async (ctx, next) => {
      ctx.res.headers.demo = "@sfajs/cloudbase";
      await next();
    })
    .useRouter()
    .run();
};
exports.main = main;
```

## 简单 demo

项目 demo 目录下有个简单 demo
