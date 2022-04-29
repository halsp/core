# @sfajs/mva

sfa MVA 框架

- 支持 RESTful 规范
- 根据文件系统映射访问路径，彻底解耦无关联功能
- 轻量化，高可扩展性
- 移除 controller 层，灵活性更高

## 安装

npm i @sfajs/mva

## 简单使用

```TS
startup.useMva()
```

```TS
import { TestStartup } from "@sfajs/core";
import "@sfajs/mva";
const res = await new TestStartup()
  .useMva()
  .run();
```

参考 `@sfajs/router` 在根目录中（ts 项目为 src 目录）添加以下文件夹：

1. 路由文件夹 `actions`，并编写 `action`，也可为其他，但通过 `routerConfig.dir` 参数指定
2. 视图文件夹 `views` ，并编写相应视图模板，也可为其他，但通过 `viewsConfig.dir` 参数指定

## 配置参数

`useMvc` 接收一个可选配置参数

- viewsConfig: `useViews` 参数
- routerConfig: `useRouter` 参数
- codes: 指定状态码对应的模板

## 过滤器

基于 `@sfajs/filter`，提供了 `ResultFilter` 过滤器

在渲染视图之前会执行 `onResultExecuting`，如果函数返回 false 将终止剩余 `ResultFilter` 过滤器执行，并取消渲染视图

在渲染视图之后执行 `onResultExecuted`，可用于统一返回视图结果

### 创建过滤器

新建一个类并实现 `ResultFilter` 接口

```TS
import { ResultFilter } from "@sfajs/mva";

class TestFilter implements ResultFilter {
  onResultExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.setHeader("result2", 2);
  }
  onResultExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.setHeader("result1", 1);
  }
}
```

### 使用过滤器

与 `@sfajs/filter` 用法相同，可以单个 Action 使用，也可以全局使用

#### 局部使用

先在 startup 引入过滤器

```TS
startup.useFilter();
```

再在 `Action` 上使用 `@UserFilters` 装饰器

```TS
@UseFilters(TestFilter)
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok("OK");
  }
}
```

#### 全局过滤器

每个 Action 都将使用全局过滤器

```TS
startup.useGlobalFilter(TestFilter)
```

## 关于 TS

你需要在 `tsconfig.json` 中的 `static` 中添加 `src/views`，让 `sfra` 编译命令能够将模板文件复制到编译目录

```JSON
"static": [
  "src/views" // 模板文件夹路径
]
```
