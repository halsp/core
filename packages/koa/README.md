# @sfajs/koa

让 koa 成为 sfa 的中间件，并打通二者中间件管道

## 安装

```
npm i @sfajs/koa
```

## 快速开始

```TS
import { TestStartup } from "@sfajs/core";
import { Koa } from "@sfajs/koa";

const res = await new TestStartup()
  .useKoa(
    new Koa().use(async (ctx) => {
      ctx.body = "Sfa loves Koa";
    })
  )
  .use(async (ctx)=>{
    console.log(ctx.res.body); // "Sfa loves Koa"
  })
  .run();
```

## 中间件管道

@sfajs/koa 会打通 sfa 和 koa 的中间件管道，就像你在 sfa 中使用 koa 中间件一样

管道流向：

1. 在 useKoa 后仍有 sfa 中间件：sfa -> koa -> sfa -> koa -> sfa
2. 在 useKoa 后没有 sfa 中间件，或 koa 某个中间件是管道终点：sfa -> koa -> sfa

因此你还可以这样玩：

```TS
import { TestStartup } from "@sfajs/core";
import { Koa } from "@sfajs/koa";
import * as cors from "koa-cors";

const res = await new TestStartup()
  .useKoa(
    new Koa()
      .use(async (ctx, next) => {
        ctx.body = "Sfa loves Koa";
        await next();
      })
      .use(async (ctx) => {
        ctx.setHeader("koa", "sfa");
        await next();
      })
  )
  .use(async (ctx, next) => {
    console.log(ctx.res.body); // "Sfa loves Koa"
    await next();
  })
  .useKoa(new Koa().use(cors()))
  .use(async (ctx) => {
    console.log(ctx.res.getHeader("koa")); // "sfa"
  })
  .run();
```

## 使用流

为了兼容各运行环境，sfa 的 ctx.body 都是已解析好的数据

因此如果涉及到流，你有两种做法可以让 `@sfajs/koa` 正确解析

1. 先解析

在 `startup.useKoa` 之前的中间件中，先解析流，将解析后的内容放入 `ctx.body`，在 koa 中间件中即可使用该数据

1. 配置传入可读流

useKoa 第二个参数的 streamingBody 传入一个函数，函数参数为 sfa 的 `ctx`，返回值类型为 `ReadableStream`

如 http(s) 环境下

```TS
import { SfaHttp } from "@sfajs/http";

new SfaHttp().useKoa(new Koa(), {
  streamingBody: (ctx) => ctx.httpReq,
});
```

如 阿里云函数 环境下

```TS
import SfaAlifunc from "@sfajs/alifunc";

new SfaAlifunc(req, resp, context).useKoa(new Koa(), {
  streamingBody: (ctx) => ctx.aliReq,
});
```
