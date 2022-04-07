# @sfajs/core

@sfajs/core 提供可配置的基础功能，添加插件或中间件以支持不同运行环境，包括但不限于 云函数 / 云调用/ 云托管 / http(s) 等

## 安装

```
npm i @sfajs/core
```

## 快速开始

```TS
import { TestStartup } from "@sfajs/core";
const res = await new TestStartup()
  .use(async (ctx) => {
    ctx.ok("sfa");
  })
  .run();
console.log("res", res);
```

## Startup

Startup 类是 sfa 的入口

为了让 sfa 能够在各类生产环境中使用，该类设计的较为开放，在 ts 中是个抽象类，因此该类不能直接使用，需要定义派生类并在合适的函数中调用 `invoke` 函数。上述示例的 `TestStartup` 是一个简单的 Startup 派生类，没有对 Request 和 Response 进行任何解析。

目前已支持的运行环境参考后面的 **sfa 环境** 部分

其他更多环境，欢迎你来实现

## Middleware

中间件是 `sfa` 最重要的部分之一，如记录日志，验证权限等

所有中间件应派生自类 `Middleware`，并实现 `invoke` 函数

### 执行顺序

中间件是以递归方式严格按声明顺序执行，每个中间件都可以修改正向或反向管道内容

在中间件里如果需要调用下一个中间件，需执行 `await this.next()`，若不调用下一个中间件，中间件将反向递归执行，并最终返回当前管道内容

```
   md1     md2   ...   mdN
    _       _           _
->-|-|-----|-|---------|-|-->   没有执行 next
   | |     | |         | |   ↓  或是最后一个
-<-|-|-----|-|---------|-|--<   反向递归
    -       -           -
```

### 注册中间件

在 `sfa` 中有两种中间件：

- startup.add( ): 类中间件
- startup.use( ): 简单中间件

类中间件更适合用于大型项目，让你的代码更易读

简单中间件适合小型快速开发的代码

```TS
import { TestStartup } from "@sfajs/core";
const startup = new TestStartup();
// 简单中间件
startup.use(async (ctx) => {
  ctx.ok("sfa");
});

// 类中间件
startup.add(asycn (ctx) => new YourMiddleware());
// OR
startup.add(asycn (ctx) => YourMiddleware);
// OR
startup.add(new YourMiddleware());
// OR
startup.add(YourMiddleware);

const res = await startup.run();
```

### 类中间件

你需要定义一个类，继承 `Middleware` 并实现 `invoke` 函数，在中间件管道中，将自动执行 `invoke`

类中间件有两种生命周期：

- Singleton 一般不建议使用，并发情况会有问题
- Scoped

```TS
import { TestStartup, Middleware } from "@sfajs/core";

class TestMiddleware extends Middleware {}

// Singleton
startup.add(new TestMiddleware()).run();

// Scoped
startup.use(async (ctx, next)=> {});
startup.add(TestMiddleware).run();
startup.add(async (ctx) => TestMiddleware).run();
startup.add(async (ctx) => new TestMiddleware()).run();
```

> 应当注意在单例模式中，如果项目存在并发情况，使用管道中的内容如 `this.ctx`，可能会出错，因为管道内容可能会被刷新，你无法保证处理的是预期管道。

### 简单中间件

简单中间件不需要单独写一个中间件类，但其底层仍然会被转化为普通类中间件来执行

```JS
startup.use((ctx) => {
  ctx.ok("sfa");
});
```

OR

```JS
startup.use(async (ctx, next) => {
  ctx.ok("sfa");
  await next();
  ctx.res.setHeader("app", "sfa");
});
```

## 中间件钩子

中间件钩子可以在中间件的不同生命周期，运行指定的代码

- 钩子本质也会被转换为中间件
- 钩子只会作用于其后的中间件

```TS
startup.hook((ctx, md) => {}, HookType)
```

该函数有两个参数

1. 钩子回调函数，有两个参数
   - 参数 1：管道 HttpContext 对象
   - 参数 2：中间件对象或中间件构造函数
     - 如果钩子类型为 `Constructor`，则参数为中间件构造函数
     - 如果钩子类型不为 `Constructor`，则参数为中间件对象
   - 返回值：
     - 如果钩子类型为 `Constructor`，则需要返回中间件对象
     - 如果钩子类型不为 `Constructor`，则没有返回值
1. 钩子类型，有以下几种钩子
   - `BeforeInvoke`：在中间件执行之前执行
   - `AfterInvoke`：在中间件执行之后执行，即 `next` 之后
   - `BeforeNext`：在中间件 `next` 执行前执行，如果在中间件中没有调用 `next`，将不触发这种钩子
   - `Constructor`：用于构造中间件，利用这种钩子可以动态使用中间件。但注册的中间件，必须是中间件的构造器，即 `startup.add(YourMiddleware)` 的方式

```TS
  import { Middleware, TestStartup } from "@sfajs/core";

  const startup = new TestStartup()
    .hook((md) => {
      // 1 before hook
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    .add(TestMiddleware)
    .hook((md) => {
      // 2 before hook
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    .add(TestMiddleware)
    .hook((md) => {
      // 3 before hook
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    .hook((ctx, md) => {
      // AfterInvoke: executed but without effective
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    }, HookType.AfterInvoke)
    .hook((ctx, md) => {
      // BeforeNext: executed before next
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    }, HookType.BeforeNext)
    .add(TestMiddleware)
    .use((ctx) => ctx.ok());
```

## HttpContext

管道中的内容都在 `HttpContext` 对象之中，每个中间件都可以调用 `this.ctx` 来获取或修改管道内容

该对象包含以下内容：

- res 字段: `SfaResponse` 实例对象
- req 字段: `SfaRequest` 实例对象
- bag 函数：用于在管道中传递更多内容

### SfaResponse

作为 API 返回内容（在 Startup 可能会被解析后返回）

包含以下内容

- headers: 返回的头部
- body: 返回的内容
- status: 返回状态码
- isSuccess: 返回值是否成功，status >= 200 && status < 300
- setHeaders: 设置多个 header
- setHeader: 设置单个 header
- hasHeader: 判断 header 是否存在，忽略 key 大小写
- removeHeader: 移除一个 header，忽略 key 大小写
- getHeader: 获取一个 header 值，忽略 key 大小写

在每个中间件都可以修改 `this.ctx.res` 中的内容

#### X-HTTP-Method-Override

如果请求头部包含 `X-HTTP-Method-Override` 参数，则访问方法 `httpMethod` 以 `X-HTTP-Method-Override` 值为准

比如 Action 要求 `PATCH` 请求，但微信小程序不支持 `PATCH`，那么可以使用 `POST` 访问，并在头部加上此参数，值为 `PATCH`

```JSON
"headers":{
  "X-HTTP-Method-Override": "PATCH"
}
```

### SfaRequest

在中间件中，可通过 `this.ctx.req` 方式获取请求内容

`req` 对象包含以下内容

- path: 访问路径，不带域名和查询参数，自动去除开头 `/`
- params: 查询参数
- body: body 内容
- headers: 获取 header 的深拷贝值，get 属性
- setHeaders: 设置多个 header
- setHeader: 设置单个 header
- hasHeader: 判断 header 是否存在，忽略 key 大小写
- removeHeader: 移除一个 header，忽略 key 大小写
- getHeader: 获取一个 header 值，忽略 key 大小写

### `bag` 函数

可以在管道中传递更多自定义内容。

如果使用 TS，可以借泛型特性获得更多智能提示。

sfa 支持两种引用类型的 bag

- Singleton: 单例模式，添加后可多次获取同一引用
- Transient: 临时模式，添加后每次获取都会创建一个新引用

如果是值类型，每次获取的都是该值的拷贝

#### 添加或修改 `bag`

```JS
// Singleton
this.ctx.bag("BAG_NAME", { /*bag content*/ });
```

OR

```JS
// Transient
this.ctx.bag("BAG_NAME", () => { /*bag content*/ });
```

#### 获取 `bag`

```JS
const val = this.ctx.bag("BAG_NAME")
```

或 TS

```TS
const val = this.ctx.bag<string>("BAG_NAME")
```

## 内置结果函数

目前 `ctx` 和中间件中内置一些返回结果：

- ok, 200
- created, 201
- accepted, 202
- noContent, 204
- partialContent, 206
- redirect, 30\*
- badRequest, 400
- badRequestMsg, 400
- forbidden, 403
- forbiddenMsg, 403
- notFound, 404
- notFoundMsg, 404
- methodNotAllowed, 405
- methodNotAllowedMsg, 405
- notAcceptable, 406
- notAcceptableMsg, 406
- requestTimeout, 408
- requestTimeoutMsg, 40
- conflict, 409
- conflictMsg, 409
- gone, 410
- goneMsg, 410
- preconditionFailed, 412
- preconditionFailedMsg, 412
- requestTooLong, 413
- requestTooLongMsg, 413
- unsupportedMediaType, 415
- unsupportedMediaTypeMsg, 415
- imATeapot, 418
- imATeapotMsg, 418
- misdirected, 421
- misdirectedMsg, 421
- unprocessableEntity, 421
- unprocessableEntityMsg, 421
- internalServerError, 500
- internalServerErrorMsg, 500
- notImplemented, 501
- notImplementedMsg, 501
- badGateway, 502
- badGatewayMsg, 502
- serviceUnavailable, 503
- serviceUnavailableMsg, 503
- gatewayTimeout, 504
- gatewayTimeoutMsg, 504
- httpVersionNotSupported, 505
- httpVersionNotSupportedMsg, 505

如在类中间件中

```TS
this.ok("success");
```

等同于

```TS
this.ctx.res.body = "success";
this.ctx.res.status = 200;
```

```TS
import { Middleware } from "@sfajs/core";
export class extends Middleware {
  async invoke() {
    this.noContent();
    // or this.ok('success');
  }
}
```

```TS
import { Middleware } from "@sfajs/core";
export class extends Middleware {
  async invoke() {
    const { account, password } = this.ctx.req.query;

    if (/*Incorrect username or password*/) {
      this.notFoundMsg({ message: "Incorrect username or password" });
    } else {
      this.ok({
        /*messages*/
      });
    }
  }
}
```

多数内置类型支持传入 `body` 可选参数，`body` 为返回的内容。
API 返回错误时，可统一返回 `ErrorMessage`，命名以 `Msg` 结尾的内置类型接受 `ErrorMessage` 参数。

## Sfa 运行环境

- [@sfajs/cloudbase](https://github.com/sfajs/cloudbase): 将 sfa 托管到腾讯云 CloudBase
- [@sfajs/alifunc](https://github.com/sfajs/alifunc): 将 sfa 托管到阿里云函数计算
- [@sfajs/http](https://github.com/sfajs/http): 将 sfa 托管到 http(s) 环境

> 🎉 更多环境欢迎贡献并编辑此 [README](https://github.com/sfajs/core/edit/main/README.md) 以添加

## Sfa 中间件

- [@sfajs/router](https://github.com/sfajs/router): 路由中间件
- [@sfajs/static](https://github.com/sfajs/static): 静态资源中间件
- [@sfajs/views](https://github.com/sfajs/views): 视图渲染中间件
- [@sfajs/mva](https://github.com/sfajs/mva): MVC 框架
- [@sfajs/swagger](https://github.com/sfajs/swagger): 使用 swagger 自动生成你的 sfa 文档
- [@sfajs/koa](https://github.com/sfajs/koa): 让 koa 成为 sfa 的中间件，并打通二者中间件管道

> 🎉 更多中间件欢迎贡献并编辑此 [README](https://github.com/sfajs/core/edit/main/README.md) 以添加
