# @sfajs/jwt

基于 [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) 的 JWT 中间件

## 快速开始

```TS
import "@sfajs/jwt";
startup.useJwt(options);
```

```TS
import "@sfajs/jwt";
import { TestStartup } from "@sfajs/core";

const res = await new TestStartup()
  .useJwt(options)
  .run()
```

## 配置

`useJwt` 接收一个配置参数，包括以下配置

### secret

jwt 密钥

### publicKey & privateKey

jwt 公钥和私钥

RSA 和 ECDSA 加密的 PEM 公钥

### signOptions & verifyOptions

创建 `jwt token` 和验证 `jwt token` 是的配置参数

具体配置参考 [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

### `prefix`

`jwt token` 的前缀，用于解析，默认为 `Bearer`

### getToken

`getToken` 是一个回调函数，用于指示 `jwt token` 的位置，如 `headers`/`query` 中

使用 `useJwt` 后会给 `HttpContext` 对象增加 `jwtToken` 属性，默认取自请求头部 `Authorization` 值

设置 `getToken` 后可以从其他位置获取 `jwt token`

### auth

`auth` 是一个回调函数，函数返回 `Promise<bool>`

用于自定义验证 `jwt token` 的合法性。除此之外，你也可以自定义中间件来实现更加复杂的验证逻辑

如果回调函数返回值为 true，则表明验证通过，会继续执行下一个中间件

如果回调函数返回值为 false，则表明验证失败。如果你没有设置状态码（默认为 404），则 http 请求将返回 401

## JwtService

JwtService 提供了一些 jwt 接口

你可以通过以下方式创建和使用 `JwtService`

### createJwtService

```TS
const jwtService = createJwtService(ctx);
// OR
const jwtService = createJwtService(options);
```

### 依赖注入

配合 `@sfajs/inject` 能够利用依赖注入更便捷的使用

```TS
import "@sfajs/jwt"
import "@sfajs/inject"

startup
  .useJwt()
  .useInject()
  .inject(JwtService, (ctx) => createJwtService(ctx)); // Scoped
```

```TS
class YourMiddleware extends Middleware{
  @Inject
  private readonly jwtService!:JwtService;
}
```

OR

```TS
@Inject
class YourMiddleware extends Middleware{
  constructor(private readonly jwtService:JwtService){}
}
```

## 装饰器

你可以在使用装饰器来快捷使用和解析 `jwt token`

### 在中间件中

在中间件中的装饰器会被自动解析

#### @JwtToken

`jwt token` 字符串

```TS
import { Middleware } from "@sfajs/core";
import * as jwt from "jsonwebtoken";

class TestMiddleware extends Middleware{
  @JwtToken
  private readonly token!: string;
}
```

#### @JwtObject

解析 `jwt token` 字符串并转为 json 对象

```TS
import { Middleware } from "@sfajs/core";
import * as jwt from "jsonwebtoken";

class TestMiddleware extends Middleware{
  @JwtObject
  private readonly jwt!: jwt.Jwt;
}
```

#### @JwtPayload

只取 jwt payload 部分，如果是 json 字符串，则会自动解析

```TS
import { Middleware } from "@sfajs/core";
import * as jwt from "jsonwebtoken";

class TestMiddleware extends Middleware{
  @JwtPayload
  private readonly payload!: any;
}
```

### 在其他类中

可以使用 `parseJwtDeco(ctx, obj)` 解析任意一个对象

```TS
class TestClass{
  @JwtPayload
  private readonly payload!: any;
}

const obj1 = parseJwtDeco(ctx, new TestClass());
// OR
const obj2 = parseJwtDeco(ctx, TestClass);
```

### 嵌套使用 `@JwtParse`

用 `@JwtParse` 装饰的字段，如果没有初始化，将会被自动初始化

该字段的值是一个对象，该对象中的字段也可以使用 `JwtPayload`, `JwtToken`, `JwtObject` 装饰并被自动赋值，当然也可以用`@JwtParse` 来嵌套初始化

建议在 `@sfajs/inject` 的 `useInject` 后使用 `useJwt`，从而可以使用依赖注入实例化对象，用以支持更复杂的情形

```TS
class TestClass1 {
  @JwtPayload
  private readonly payload!: any;
}

class TestClass2 {
  @JwtToken
  private readonly token!: string;
  @JwtParse
  class: TestClass1;
}

class TestMiddleware extends Middleware {
  @JwtObject
  private readonly jwt!: any;
  @JwtParse
  class1 = new TestClass1();
  @JwtParse
  class2: TestClass1;
}

const res = await new TestStartup()
    .useJwt()
    .add(TestMiddleware)
    .run();
```
