# @sfajs/views

sfa 视图渲染中间件

- 支持多种视图模板，参考 [consolidate](https://github.com/tj/consolidate.js)

## 安装

```
npm i @sfajs/views
```

## 快速开始

1. 添加视图文件夹和文件 `views/index.ejs` 并编写内容

2. 启用中间件 `startup.useViews()`

```JS
require("@sfajs/views");
const res = await new TestStartup()
  .useViews()
  .use(async (ctx) => {
    ctx.view("index.ejs");
  })
  .run();
```

## `useViews`

`useViews` 接收两个可选参数

- dir: 视图文件夹
- cfg: 配置

### 视图文件夹

默认为 `views`, 所有视图将在视图文件夹中查找

### `useViews` 配置参数

- options

通用参数，如网站名称和其他通用信息

- engines

视图渲染引擎，用于文件扩展名与 [consolidate](https://github.com/tj/consolidate.js) 对应，如

```JS
startup.useViews("views", {
  engines: {
    custom: "ejs",
    hbs: "handlebars",
  },
});
```

## ctx.view && md.view

可以使用 `ctx.view()` 渲染视图，在中间件类中，也可以使用 `this.view()` 渲染视图

`view` 函数接收两个参数

- tmpPath: 视图文件夹中的相对路径
- locals: 渲染参数

## ctx.state

`ctx.state` 作为访问级别的模板参数

比如你需要在权限验证之后，将登录信息放入 `ctx.state`

在你使用 `view` 渲染模板时，`@sfajs/views` 做了以下类似操作：

```JS
const args = Object.assign({}, options, ctx.state, locals);
```
