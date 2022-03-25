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

```TS
import { TestStartup } from "@sfajs/core";
import "@sfajs/views";

const res = await new TestStartup()
  .useViews()
  .use(async (ctx) => {
    ctx.view("index.ejs");
  })
  .run();
```

## `useViews`

`useViews` 接收一个可选配置参数

- dir: 视图文件夹
- options: 通用参数，如网站名称和其他通用信息
- engines: 视图渲染引擎列表

`engines` 用于文件扩展名与 [consolidate](https://github.com/tj/consolidate.js) 对应，如

```TS
startup.useViews({
  dir: "views",
  engines: [
    { ext: "hbs", render: "handlebars" },
    { ext: "custom", render: "ejs" },
  ],
});
```

如果扩展名与渲染引擎名称相同，可省略配置

### 视图文件夹

默认为 `views`, 所有视图将在视图文件夹中查找

## ctx.view && md.view

可以使用 `ctx.view()` 渲染视图，在中间件类中，也可以使用 `this.view()` 渲染视图

`view` 函数接收两个参数

- tmpPath: 视图文件夹中的相对路径
- locals: 渲染参数

其中 `tmpPath` 可省略模板文件扩展名，也可省略 `index` 命名的文件

值为 `user/todo/index.ejs`, `user/todo/index`, `user/todo` 效果相同

## ctx.state

`ctx.state` 作为访问级别的模板参数

比如你需要在权限验证之后，将登录信息放入 `ctx.state`

在你使用 `view` 渲染模板时，`@sfajs/views` 做了以下类似操作：

```JS
const args = Object.assign({}, options, ctx.state, locals);
```
