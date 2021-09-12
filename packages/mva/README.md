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
import { TestStartup } from "sfa";
import "@sfajs/mva";
const res = await new TestStartup()
  .useMva()
  .run();
```

参考 `@sfajs/router-act` 在根目录中（ts 项目为 src 目录）添加以下文件夹：

1. 路由文件夹 `actions`，并编写 `action`，也可为其他，但通过 `routerConfig.dir` 参数指定
2. 视图文件夹 `views` ，并编写相应视图模板，也可为其他，但通过 `viewsConfig.dir` 参数指定

## 配置参数

`useMvc` 接收一个可选配置参数

- viewsConfig: `useViews` 参数
- routerConfig: `useRouter` 参数
- codes: 指定状态码对应的模板

## 关于 TS

你需要在 `tsconfig.json` 中的 `static` 中添加 `src/views`，让 `sfra` 编译命令能够将模板文件复制到编译目录

```JSON
"static": [
  "src/views" // 模板文件夹路径
]
```
