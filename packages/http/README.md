# @sfajs/http

让 sfa 能够运行于 http(s) 而不止于云函数

你可以随时将 sfa 云函数简单改为 nginx 托管的 sfa http 服务，当然也可以将 nginx 托管的 sfa http 服务简单改为 sfa 云函数

## 安装

```
npm install @sfajs/http
```

## 快速开始

以下示例开启一个服务，端口当然是 2333 啦

```JS
const { SfaHttp } = require('@sfajs/http');

new SfaHttp()
  .use(async (ctx) => {
    ctx.ok("@sfajs/http");
  })
  .listen(2333);
```

@sfajs/http 也支持 https，只需将上述示例中的 `SfaHttp` 改为 `SfaHttps`

## 组合其他中间件

### @sfajs/router

```JS
const { SfaHttp } = require('@sfajs/http');
require('@sfajs/router')

new SfaHttp()
  .useRouter()
  .listen(2333);
```

### @sfajs/static

```JS
const { SfaHttp } = require('@sfajs/http');
require('@sfajs/router')

new SfaHttp()
  .useStatic()
  .listen(2333);
```
