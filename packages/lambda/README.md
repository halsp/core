# @sfajs/cloudbase

Hosting sfa in cloudbase

## 安装

npm i @sfajs/cloudbase

## 像 1，2，3 一样简单

```JS
import SfaCloudbase from "@sfajs/cloudbase";

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
import SfaCloudbase from "@sfajs/cloudbase";
import "@sfajs/router";

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
