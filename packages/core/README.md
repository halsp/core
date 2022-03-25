# @sfajs/core

sfa provides configurable basic functions. You can add middleware to support different environments, including but not limited to cloud functions, http(s), etc.

## Installation

```
npm i @sfajs/core
```

## Quick Start

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

The startup class is the entry to sfa

In order to enable sfa to be used in all kinds of production environments, the design is relatively open, and thr Startup is an abstract class in TS, so it can not be used directly. It is necessary to define derived classes and call `invoke` functions in suitable functions. The `TestStartup` in the above example is a simple startup derived class, which does not parse request and response

Refer to the **Sfa environment** section below for the currently supported running environment

Other more environment, welcome you to realize

## Middleware

Middleware is one of the most important parts of sfa, such as logging, verifying authority and so on

All middlewares should be derived from the class `Middleware` and implement the `invoke` function

### Execution order

Middleware is executed recursively in strict order of declaration, and each middleware can modify the forward or reverse pipeline data

If you need to call the next middleware in the middleware, you need to execute `await this.next()`. If you do not call the next middleware, the middleware will execute backward recursively, and finally return the current pipeline data

```
   md1     md2   ...   mdN
    _       _           _
->-|-|-----|-|---------|-|-->   without `next`
   | |     | |         | |   ↓  or the last one.
-<-|-|-----|-|---------|-|--<   backward recursion
    -       -           -
```

### Registration middleware

There are two kinds of middleware in `sfa`:

- startup.add( ): Class middleware
- startup.use( ): Simple middleware

Class middleware is more suitable for large projects and makes your code easier to read

Simple middleware is suitable for small and fast projects

```TS
import { TestStartup } from "@sfajs/core";
const startup = new TestStartup();
// Simple middleware
startup.use(async (ctx) => {
  ctx.ok("sfa");
});
// Class middleware
startup.add(() => new YourMiddleware());

const res = await startup.run();
```

### Class middleware

You need to define a class, inherit `Middleware` and implement the `invoke` function. In the pipeline, the `invoke` function will be executed automatically

Class middleware has two types of life cycle:

- Singleton
- Scoped

```TS
import { TestStartup } from "@sfajs/core";

// Singleton
const res = await new TestStartup().add(new YourMiddleware()).run();

// Scoped
const res = await new TestStartup().add((ctx) => new YourMiddleware()).run();
```

> It should be noted that in singleton mode, if there is concurrency in the project, using the data in the pipeline, such as `this.ctx`, may cause errors, because the pipeline data may be refreshed, and you cannot guarantee that you are dealing with the expected pipeline.

### Simple middleware

When using simple middleware, you don't need to write a separate middleware class, but in the underlying implementation, it will still be converted into ordinary class middleware for execution

```JS
startup.use(async (ctx) => {
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

## HttpContext

The data in the pipeline is in the `HttpContext` object, and each middleware can call `this.ctx` to get or modify the pipeline data

The `HttpContext` object contains the following:

- res property: `SfaResponse` object
- req property: `SfaRequest` object
- bag function: Used to pass more data in a pipe

### SfaResponse

Return data (It will be parsed in a specific environment)

includes:

- headers: headers
- body: Content returned
- status: Status code
- isSuccess: If status >= 200 && status < 300
- setHeaders: Set headers
- setHeader: Set a header
- hasHeader: Is the header name existed, ignore name case
- removeHeader: remove a header, ignore name case
- getHeader: get a header value, ignore name case

In each middleware, you can modify the data in `this.ctx.res`

#### X-HTTP-Method-Override

If the request headers contain the `X-HTTP-Method-Override` item, the `httpMethod` will based on the value of `X-HTTP-Method-Override`

For example, if a `Action` requires `PATCH` request, but wechat miniapp does not support `PATCH`. Then you can use `POST` to access and add this parameter to the headers with the value of `PATCH`

```JSON
"headers":{
  "X-HTTP-Method-Override": "PATCH"
}
```

### SfaRequest

In the middleware, you can get the request content through `this.ctx.req`

The `req` object contains the following:

- path: Access path, without domain name and query parameters, automatically remove the beginning `/`
- query: Query parameters
- body: Body content
- headers: headers
- setHeaders: Set headers
- setHeader: Set a header
- hasHeader: Is the header name existed, ignore name case
- removeHeader: remove a header, ignore name case
- getHeader: get a header value, ignore name case

### `bag` function

You can pass more custom content in the pipeline

If you use TS, you can use the template feature to get more smart tips

Sfa supports two reference types of bags:

- Singleton: The same reference can be getting multiple times after adding
- Transient: A new reference is created for each getting after adding

If it is a value type, every time you get a copy of the value

#### Add or modify `bag`

```JS
// Singleton
this.ctx.bag("BAG_NAME", { /*bag content*/ });
```

OR

```JS
// Transient
this.ctx.bag("BAG_NAME", () => { /*bag content*/ });
```

#### Get bag

```JS
const val = this.ctx.bag("BAG_NAME")
```

OR TS

```TS
const val = this.ctx.bag<string>("BAG_NAME")
```

## Built-in result functions

`ctx` and the middleware have some built-in result functions:

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
- errRequest, 500
- errRequestMsg, 500

As in class middleware

```TS
this.ok("success");
```

Equivalent to

```TS
this.ctx.res.body="success";
this.ctx.res.status=200;
```

```TS
import { Middleware } from "@sfajs/core";
export default class extends Middleware {
  async invoke() {
    this.noContent();
    // or this.ok('success');
  }
}
```

```TS
import { Middleware } from "@sfajs/core";
export default class extends Middleware {
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

Most built-in result functions pass in optional `body` parameters

When an error occurs, `HttpErrorMessage` can be returned uniformly, and the built-in functions whose name ends with `Msg` accepts the `HttpErrorMessage` parameter

## Sfa environment

- [@sfajs/cloudbase](https://github.com/sfajs/cloudbase): 将 sfa 托管到腾讯云 CloudBase
- [@sfajs/alifunc](https://github.com/sfajs/alifunc): 将 sfa 托管到阿里云函数计算
- [@sfajs/http](https://github.com/sfajs/http): Host sfa to http(s) environment

> 🎉 You are welcome to contribute more environments and edit this [README](https://github.com/sfajs/core/edit/main/README.md) to add

## Sfa middlewares

- [@sfajs/router](https://github.com/sfajs/router): Actions Routing middleware
- [@sfajs/static](https://github.com/sfajs/static): Static resource middleware
- [@sfajs/views](https://github.com/sfajs/views): View rendering middleware
- [@sfajs/mva](https://github.com/sfajs/mva): MVA framework
- [@sfajs/swagger](https://github.com/sfajs/swagger): Use swagger to automatically generate your sfa document
- [@sfajs/koa](https://github.com/sfajs/koa): Let koa become the middleware of sfa and connect their middleware pipeline

> 🎉 You are welcome to contribute more middleware and edit this [README](https://github.com/sfajs/core/edit/main/README.md) to add
