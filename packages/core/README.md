# sfa

serverless function api framework （ serverless 云函数 API 框架 ）

使用 sfa 你能够将 API 托管到各服务商的云函数，充分利用云函数的优越性

sfa 提供可配置的基础功能，添加插件或中间件以支持不同运行环境，包括但不限于 云函数 / 云调用/ 云托管 / http(s) 等

## 安装

```
npm i sfa
```

## 开始使用

```JS
const { TestStartup } = require("sfa");
const res = await new TestStartup()
    .use(async (ctx, next) => {
      ctx.res.body = "sfa";
    })
    .run();
console.log('res',res);
```

## Startup

Startup 类是 sfa 的入口

为了让 sfa 能够在各类生产环境中使用，该类设计的较为开放，在 ts 中是个抽象类，因此该类不能直接使用，需要定义派生类并在合适的函数中调用 `invoke` 函数。上述示例的 `TestStartup` 是一个简单的 Startup 派生类，没有对 Request 和 Response 进行任何解析。

- 在 cloudbase 云函数环境中，可以使用 `@sfajs/cloudbase`。`@sfajs/cloudbase` 中有继承于类 `Startup` 的 `SfaCloudbase`，并对云函数入参 event 和 context 进行了解析
- 在 http 环境中，可以使用 `@sfajs/http`。`@sfajs/http` 中有继承于类 `Startup` 的 `SfaHttp`，并对 Request 和 Response 进行了解析

其他更多环境，欢迎你参考以上方案来实现

## 中间件

中间件是 `sfa` 最重要的部分之一，如记录日志，验证权限等

所有中间件应派生自类 `Middleware`，并实现 `invoke` 函数

### 执行顺序

中间件是以递归方式严格按声明顺序执行，每个中间件都可以修改正向或反向管道内容

在中间件里如果需要调用下一个中间件，需执行 `await this.next()`，若不调用下一个中间件，中间件将反向递归执行，并最终返回当前管道内容

```
 中间件1   中间件2 ... 中间件n
    _       _           _
->-|-|-----|-|---------|-|-->   没有执行 next
   | |     | |         | |   ↓  或是最后一个
-<-|-|-----|-|---------|-|--<   反向递归
    -       -           -
```

### 注册中间件

你需要使用 `startup.use` 注册中间件，传参是一个创建中间件的回调函数，如

```js
const { TestStartup } = require("sfa");
const startup = new TestStartup(event, context);
// 简单中间件
startup.use(async (ctx) => {
  ctx.res.body = "hello world";
});
// 类中间件
startup.use(() => new YourMiddleware());

const res = await startup.run();
```

### 简单中间件

简单中间件不需要单独写一个中间件类，但其底层仍然会被转化为普通类中间件来执行

```JS
startup.use(async (ctx) => {
  ctx.res.body = "hello world";
});
```

或

```JS
startup.use(async (ctx, next) => {
  ctx.res.body = "hello world";
  await next();
  ctx.res.setHeader("app", "sfa");
});
```

### 内置结果函数

目前中间件中内置一些返回结果：

- ok, 200
- accepted, 202
- created, 201
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
- errRequest, 500
- errRequestMsg, 500

如

```TS
this.ok("success");
```

等同于

```TS
this.ctx.res.body="success";
this.ctx.res.status=200;
```

#### 在中间件中

```JS
const { Middleware } = require("sfa");
export default class extends Middleware {
  async invoke() {
    this.noContent();
    // or this.ok('success');
  }
}
```

```JS
const { Middleware } = require("sfa");
export default class extends Middleware {
  async invoke() {
    const { account, password } = this.ctx.req.params;

    if (/*账号或密码错误*/) {
      this.notFoundMsg({ message: "账号或密码错误" });
    } else {
      this.ok({
        /*返回信息*/
      });
    }
  }
}
```

多数内置类型支持传入 `body` 可选参数，`body` 为返回的内容。
API 返回错误时，可统一返回 `ErrorMessage`，命名以 `Msg` 结尾的内置类型接受 `ErrorMessage` 参数。

## HttpContext

管道中的内容都在 `HttpContext` 对象之中，每个中间件都可以调用 `this.ctx` 来获取或修改管道内容

该对象包含以下内容：

- res 字段: `Response` 对象
- req 字段: `Request` 对象
- bag 函数：用于在管道中传递更多内容

### Response

作为 API 返回内容（在 Startup 可能会被解析后返回）

包含以下内容

- headers: 返回的头部
- body: 返回的内容
- status: 返回状态码
- isSuccess: 返回值是否成功，status >= 200 && status < 300
- headers: 获取 header 的深拷贝值，get 属性
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
  "X-HTTP-Method-Override":"PATCH"
}
```

### Request

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

### bag 函数

可以在管道中传递更多自定义内容。

如果使用 TS，可以借泛型特性获得更多智能提示。

sfa 支持两种引用类型的 bag

- Singleton: 单例模式，添加后可多次获取同一引用
- Transient: 临时模式，添加后每次获取都会创建一个新引用

如果是值类型，每次获取的都是该值的拷贝

#### 添加或修改 bag

```JS
// 单例模式
this.ctx.bag("BAG_NAME", { /*bag content*/ });
```

或

```JS
// 临时模式
this.ctx.bag("BAG_NAME", () => { /*bag content*/ });
```

#### 获取 bag

```JS
const val = this.ctx.bag("BAG_NAME")
```

或 TS

```TS
const val = this.ctx.bag<string>("BAG_NAME")
```

## sfa 环境

- 腾讯云 CloudBase: [@sfajs/cloudbase](https://github.com/sfajs/cloudbase)
- 阿里云 HTTP 函数: [@sfajs/alifunc](https://github.com/sfajs/alifunc)
- http(s): [@sfajs/http](https://github.com/sfajs/http)

> 🎉 更多环境欢迎贡献并编辑此 [README](https://github.com/sfajs/sfa/edit/main/README.md) 以添加

## sfa 中间件

- 路由: [@sfajs/router](https://github.com/sfajs/router)
- 静态资源: [@sfajs/static](https://github.com/sfajs/static)
- 视图渲染: [@sfajs/views](https://github.com/sfajs/views)

> 🎉 更多中间件欢迎贡献并编辑此 [README](https://github.com/sfajs/sfa/edit/main/README.md) 以添加
