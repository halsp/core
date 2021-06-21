# @sfajs/router

sfa 路由中间件

- 支持 RESTful 规范
- 根据文件系统映射访问路径，彻底解耦无关联的功能
- 支持身份权限认证

## 安装

npm i @sfajs/router

## 示例

项目 demo 目录下包含 `ts 项目` 和 `js 项目` 的简单 demo

## 简单使用

```TS
startup.useRouter()
```

```TS
import { TestStartup } from "sfa";
import "@sfajs/router";
const res = await new TestStartup()
  .useRouter()
  .run();
```

## 构建

在 package.json 文件的 scripts 节点下添加

```JSON
"build": "router-build"
```

```JSON
{
  "scripts": {
    "build": "router-build controllers" // controllers 为路由文件夹路径
  },
  "dependencies": {
    "sfa": "^0.3.2",
    "@sfajs/router": "^0.3.1"
  }
}
```

根目录添加路由文件夹 `controllers` （可以为项目下任意位置任意命名，后面有介绍）

构建时运行

```
npm run build
```

### 构建结果

- js 项目，将生成 `sfa-router.map` 文件，你可能需要将该文件添加至 `.gitignore` 中

- ts 项目，将按 `tsconfig.json` 中的 `compilerOptions/target` 生成目标文件，同时也会在目标文件夹下生成 `sfa-router.map` 文件

## 路由（useRouter）

首先引入 `@sfajs/router`

```JS
import "@sfajs/router";
```

然后注册路由中间件 `startup.useRouter` 以支持路由功能

```JS
const res = await new TestStartup().useRouter().run();
```

或

```JS
const res = await new OtherStartup().useRouter().run();
```

> `useRouter` 实际上可能会注册多个中间件

## 路由解析

`startup.useRouterParser` 接收两个参数：

- dir: 路由文件夹，`@sfajs/router` 能够将路由文件夹下的所有 `Action` 映射为 `http` 访问路径。所有 API Action 统一放在这个文件夹中，在该目录中，建立各 `Action` 文件或文件夹。`Action` 文件是 API 的最小执行单元，详情后面 [Action](##Action) 部分有介绍
- strict: 严格模式，默认值为 true，建议为 true。如果值为 true，文件命名必须与 httpMethod 相同，如果 `strict` 为 `false` ，则 RESTFul 规范的 API 可能会以非 RESTFul 方式调用。如文件系统为`controllers/user/login/get.ts`，访问本应是 `GET user/login`，但 `POST user/login/get` 也能调用。因此如果使用 RESTFul 或限制 method，建议设置 `strict` 为 `true`。

`startup.useRouterParser` 会在管道 `ctx` 中加入

- actionPath: `action` 实际相对路径
- actionRoles: `action` 的 `roles` 属性值，用于权限验证

一般情况你无需主动调用路由解析，因为 `startup.useRouter` 也会解析路由并在管道加入以上两个字段

但当你要使用 `action` 的实际路径，或默认权限验证无法满足需求时，你就需要在 `startup.useRouterParser` 之后实现需求

```TS
import { TestStartup } from "sfa";
import "@sfajs/router";

const res = await new TestStartup()
  .useRouterParser()
  .use(async (ctx) => {
    ctx.ok({
      actionPath: ctx.actionPath,
      actionRoles: ctx.actionRoles,
    });
  })
  .useRouter()
  .run();
```

## 路由匹配

在`@sfajs/router`中，路由与文件系统匹配。

路由查询参数命名以 `^` 开头（文件系统中命名不允许出现字符 `:`），如果存在多个查询参数则后面的会覆盖前面的，如 `GET user/^id/todo/^id`，则 `id` 值为 `todoId`。正确命名应如 `user/^userId/todo/^todoId`。

如果限制 `httpMethod`, `action` 应以 `post.ts`、`get.ts`、`delete.ts`、`patch.ts`、`put.ts` （或其他自定义 method，扩展名为.js 效果相同 ）命名，否则任意 `httpMethod` 都可以访问。

#### 例 1

获取 todo list

##### 方式 1（建议）

目录结构如下：

```
+-- controllers
|   +-- todo
|       +-- get.ts
```

访问地址为 `GET /todo`，

##### 方式 2

目录结构如下：

```
+-- controllers
|   +-- todo
|       +-- getTodoList.ts
```

访问地址为 `GET /todo/getTodoList` 、 `POST /todo/getTodoList` 、 `PUT /todo/getTodoList` 等等，效果相同。

#### 例 2

获取单个 todo item

##### 方式 1（建议）

目录结构如下：

```
+-- controllers
|   +-- todo
|       +-- ^id
|           +-- get.ts
```

访问地址为 `GET /todo/66`

##### 方式 2

目录结构如下：

```
+-- controllers
|   +-- todo
|       +-- getTodoItem.ts
```

访问地址为 `GET(POST 等) /todo/getTodoItem`，需要在 `body` 、 `header` 或 `queryParams` 传入 `todoId` 参数

#### 示例建议

上述两个示例都给了两种定义方式，建议使用方式 1 更符合规范，易读性也更好。

## Action

`Action` 也是中间件，该类继承于中间件类 `Middleware`，但 `Action` 中间件会在 `userRouter` 中自动注册，你无需手动注册

正常情况 Action 会终止管道继续向后执行，不会执行 `next`，除非有其他特殊需求

每次调用 API，如果顺利进行，主要执行的是自定义 `Action` 类实例对象中的 `invoke` 函数

所有自定义 `Action` 都应派生自 `Action` 类，并重写 `invoke` 函数

### 创建一个 Action

#### 创建路由文件夹

在项目下任意位置创建一个任意命名的文件夹（如果不存在）

建议在与 `index.ts` / `index.js` 同级目录下， 创建名为 `controllers` 的文件夹

#### 创建 action 文件

根据各业务，创建文件夹或 `.ts/.js` 文件，名称自定，但名称和路径会映射为访问路径，每个文件对应一个 `action`

action 的名称和路径会映射为访问路径，每个文件对应一个 `action`

建议对 action 文件的命名为 get.ts/post.ts/patch.ts 等 httpMethod（否则 strict 为 true 的情况将忽略其他命名）

```
+-- controllers
|   +-- type1
|       +-- post.ts
|       +-- get.ts
|       +-- ...
|   +-- type2
|       +-- patch.ts
|       +-- delete.ts
|       +-- ^id
|           +-- put.ts
|           +-- ...
```

#### 创建 action 类

在 action 文件 (`.ts/.js`) 中创建继承 `Action` 的类，并重写 `invoke` 函数

```JS
import { Action } from "@sfajs/router";
export default class extends Action {
  async invoke() {
    this.ok({
      result: 'success'
    });
  }
}
```

## 权限

默认的权限可以精确到控制每个 `Action`，你需要在中间件 `startup.useRouterParser` 之后加入权限中间件

### Action 权限参数

`Action` 构造函数有一个可选参数，传入字符串数组，值为允许的权限角色。

如判断调用需要登录信息：

```ts
["login"];
```

如判断调用者是管理员：

```ts
["admin"];
```

```ts
import { Action } from "@sfajs/router";
export default class extends Action {
  constructor() {
    super(["login"]);
  }

  async invoke(): Promise<void> {
    const { account } = this.ctx.req.headers; // 在auth中已经验证 account 的正确性，因此可认为调用者身份无误。

    const todoList = []; // 可放心从数据库读取用户数据，因为 account 已验证登录
    this.ok(todoList);
  }
}
```

下例用 ts 创建中间件类 `Auth`，继承于 `Middleware`，使用请求头部的账号信息验证调用者信息：

```TS
// 中间件，用于权限验证
class Auth extends Middleware {
  async invoke(): Promise<void> {
    if (!this.ctx.actionRoles || !this.ctx.actionRoles.length) {
      await this.next(); // 无需验证，执行下一个中间件
      return;
    }

    if (this.ctx.actionRoles.includes("login") && !this.loginAuth()) {
      this.forbidden("账号或密码错误"); // 终止中间件的执行
      return;
    }

    await this.next(); // 验证通过，执行下一个中间件
  }

  loginAuth() {
    // 实际情况应该需要查表等复杂操作
    const { account, password } = this.ctx.req.headers;
    return account == "abc" && password == "123456";
  }
}
```

注册中间件

```JS
startup.add(() => new Auth())
```

## query

`@sfajs/router` 会在 `ctx.req` 中添加 `query` 属性

在 `startup.useRouter`、`startup.useRouterParser` 之后的中间件，都可以获取 `ctx.req.query`

`query` 内容是 RESTful 路径中的参数，如

- 访问路径：`/user/66/todo/88`
- action 文件路径：`/user/^userId/todo/^todoId/get.ts`

那么 `query` 值为

```JSON
{
  "userId": 66,
  "todoId": 88
}
```

## 关于 TS

如果你在 `tsconfig.json` 中设置了输出文件夹 `compilerOptions/outDir`，那么 `router-build` 命令参数中的路由文件夹是 `outDir` 下的相对路径

```JSON
// tsconfig.json
{
  "compilerOptions": {
    "outDir": "dist"
  }
}
```

如 `outDir` 值为 `dist`，构建命令为 `router-build controllers`，那么 `dist/controllers` 应该是生产用的路由文件夹
