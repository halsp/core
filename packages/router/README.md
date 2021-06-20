# @sfajs/router

sfa 路由中间件

- 支持 RESTful 规范
- 根据文件系统映射访问路径，彻底解耦无关联的功能
- 支持自动化文档
- 内置权限认证

## 安装

npm i @sfajs/router

## 示例

项目 demo 目录下包含 `ts 项目` 和 `js 项目` 的简单 demo

## 构建

在 package.json 文件的 scripts 节点下添加

```JSON
"build": "sfa-router-build"
```

```JSON
{
  "scripts": {
    "build": "sfa-router-build"
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

js 项目，将生成 `sfa-router.map` 文件，你可能需要将该文件添加至 `.gitignore` 中
ts 项目，将按 `tsconfig.json` 中的 `compilerOptions/target` 生成目标文件，同时也会在目标文件夹下生成 `sfa-router.map` 文件

## 配置文件

在项目目录下定义 `sfa-router.json` 文件，一个常规配置文件如下：

```JSON
{
  "router": {  // 路由相关
    "dir": "controllers", // 路由文件夹目录
    "strict": false // 是否严格控制 httpMethod
  },
  "ts": { // ts编写代码的配置
    "static": [ // 静态文件/文件夹。由于ts的生成目录一般在其他位置，如果有生产环境需要的非 .ts 文件，需要在此声明
      {
        "source": "static", // 原文件/文件夹相对路径
        "target": "assets" // 目标文件/文件夹相对路径
      },
      {
        "source": "static.txt",
        "target": "read.txt"
      }
    ]
  },
  "doc": { // 使用 sfa-router-doc 命令生成文档时必须，详情参考后面的 “自动化文档”
    "output": "../docs/api/README.md",
    "title": "@sfajs/router-title",
    "subtitle": "@sfajs/router-subtitle",
    "parts": [
      {
        "name": "part1",
        "inputHeaders": [
          {
            "name": "base-input-header",
            "desc": "this is a base input header",
            "type": "string"
          }
        ]
      },
      {
        "name": "part2",
        "outputHeaders": [
          {
            "name": "base-output-header",
            "desc": "this is a base output header",
            "type": "string"
          }
        ]
      },
      {
        "name": "part3",
        "query": [
          {
            "name": "base-query",
            "desc": "this is a base query",
            "type": "string"
          }
        ]
      }
    ],
    "partsFromAuth": true
  }
}
```

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

### 路由文件夹

配置文件的 `router.dir` 值是路由文件夹路径，`@sfajs/router` 能够将路由文件夹下的所有 `Action` 映射为 `http` 访问路径

如果配置文件没有该值，默认为 `controllers`，并且在根目录下（ts 则是生成目录下）需要定义此文件夹

所有 API Action 统一放在这个文件夹中，在 `controllers` 目录中，建立各文件或文件夹。文件是 API 的最小执行单元 Action，详情后面 [Action](##Action) 部分有介绍。

### 路由匹配

在`@sfajs/router`中，路由与文件系统匹配。

路由查询参数命名以 `^` 开头（文件系统中命名不允许出现字符 `:`），如果存在多个查询参数则后面的会覆盖前面的，如 `GET user/^id/todo/^id`，则 `id` 值为 `todoId`。正确命名应如 `user/^userId/todo/^todoId`。

如果限制 `httpMethod`, `action` 应以 `post.ts`、`get.ts`、`delete.ts`、`patch.ts`、`put.ts` （或其他自定义 method，扩展名为.js 效果相同 ）命名，否则任意 `httpMethod` 都可以访问。

### strict

配置文件的 `router.strict` 值决定是否开启严格模式，建议开启

开启严格模式后，`action` 将只能以 httpMethod 命名，与 RESTFul 规范相符，否则会找不到路由并返回 `404`

如果 `strict` 为 `false` 或不设置，则 RESTFul 规范的 API 可能会以非 RESTFul 方式调用。如文件系统为`controllers/user/login/get.ts`，访问本应是 `GET user/login`，但 `POST user/login/get` 也能调用。因此如果使用 RESTFul 或限制 method，建议设置 `strict` 为 `true`。

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

`Action` 也是中间件，该类继承于中间件类 `Middleware`，但 `Action` 中间件会在 `userRouter` 中自动注册，无需手动注册

正常情况 Action 会终止管道继续向后执行，不会执行 `next`，除非有其他特殊需求

每次调用 API，如果顺利进行，主要执行的是自定义 `Action` 类实例对象中的 `invoke` 函数

所有自定义 `Action` 都应派生自 `Action` 类，并重写 `invoke` 函数

### 创建一个 Action

#### 创建路由文件夹

在项目下任意位置创建一个任意命名的文件夹

建议在与 `index.ts` / `index.js` 同级目录下， 创建名为 `controllers` 的文件夹

#### 创建 action 文件

根据各业务，创建 `.ts/.js` 文件或文件夹，名称自定，但名称和路径会映射为访问路径，每个文件对应一个 `action`

action 的名称和路径会映射为访问路径，每个文件对应一个 `action`

建议对 action 文件的命名为 get.ts/post.ts/patch.ts 等

```
+-- controllers
|   +-- type1
|       +-- action1.ts
|       +-- action2.ts
|       +-- ...
|   +-- type2
|       +-- action3.ts
|       +-- action4.ts
|       +-- ^id
|           +-- action5.ts
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

默认的权限功能是用于判断用户能否使用 API，可以精确到控制每个 `Action`

`startup.useRouterAuth` 注册权限中间件，该函数接收一个参数 `builder`

`builder` 为函数类型，函数返回值为权限认证对象，该对象的类继承于 `Authority` 类，因此该类对象也是中间件，但加载方式比较特殊

你需要新写个类，继承 `Authority`，并实现 `invoke` 函数

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

下例创建类 `Auth`，继承于 `Authority`，使用请求头部的账号信息验证调用者信息：

```TS
// Authority 类，用于权限验证
class Auth extends Authority {
  async invoke(): Promise<void> {
    if (!this.roles || !this.roles.length) {
      await this.next(); // 无需验证，执行下一个中间件
      return;
    }

    if (this.roles.includes("login") && !this.loginAuth()) {
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

在 `useRouter` 使用

```JS
startup.useRouter({
  authBuilder: () => new Auth(),
})
```

## 路由解析

`startup.useRouterPraser` 会在管道 `ctx` 中加入

- actionPath: `action` 实际相对路径
- actionRoles: `action` 的 `roles` 属性值，用于权限验证

默认你无需主动调用路由解析，因为 `startup.useRouter` 和 `startup.useRouterAuth` 也会解析路由并在管道加入以上两个字段

但当你要使用 `action` 的实际路径，或默认权限验证无法满足需求时，你就需要在 `startup.useRouterPraser` 之后实现需求

```TS
import { TestStartup } from "sfa";
import "@sfajs/router";

const res = await new TestStartup()
  .useRouterPraser()
  .use(async (ctx) => {
    ctx.ok({
      actionPath: ctx.actionPath,
      actionRoles: ctx.actionRoles,
    });
  })
  .useRouter()
  .run();
```

## query

`@sfajs/router` 会在 `ctx.req` 中添加 `query` 属性

在 `startup.useRouter`、`startup.useRouterPraser`、`startup.useRouterAuth` 之后的中间件，都可以获取 `ctx.req.query`

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

## 自动化文档

`sfa-router` 支持自动化文档创建，目前已支持输出 `md` 格式文档。

文档的编写支持两种方式：

1. 字段赋值：给 `Action` 类实例对象的 `docs` 属性赋值
2. 注释解析（推荐）：按特定格式注释 `Action` 派生类

### 使用方式

使用此功能需要预先配置，后面 [自动化文档配置文件](###自动化文档配置文件) 部分有详细介绍。

然后在 package.json 文件中的 scripts 中添加

```json
  "scripts": {
    "doc": "sfa-router-doc",
  },
```

执行 `npm run doc`

### `action` 注释

参考如下格式在文件任意处注释（建议在 Action 类声明之前）：

```
/**
 * @action delete docs
 *
 * a docs test named delete
 *
 * @parts test1 test2 custom
 * @input
 * @@headers
 * @@@test-header1 {string} a test header of deleting docs NO.1
 * @@@test-header2 {number}
 * @@@test-header3 {object} a test header of deleting docs NO.3
 * @@@@test-header31 {string} a test header of deleting docs NO.3.1
 * @@@@test-header32 {number} a test header of deleting docs NO.3.2
 * @@@test-header4 a test header of deleting docs NO.4
 * @@@test-header5 {number} a test header of deleting docs NO.5
 * @@body {object} ok result
 * @@@method {string} http method
 * @@params
 * @@query
 * @output
 * @@codes
 * @@@200 success
 * @@@404
 * @@body
 * @@@method {string} http method
 */
```

`@` 的数量可对比 JSON 对象的深度，其中一级和二级是固定的，如 `@action`、`@parts`、`@input`、`@output`、`@@headers`、`@@query`、`@@body`、`@@params`、`@@code`，三级或以上不做限制

只有 `@action` 是必须的，如果没有则不会生成文档，其他都是可选的

#### @action

作为自动化文档注释的标识，其后所带内容为该 `Action` 名称，新起一行的内容则为该 `Action` 介绍

#### `@input`/`@output`

输入/输出的参数

`@input` 可选 `@@headers`、`@@query`、`@@body`、`@@params`

`@output` 可选 `@@headers`、`@@body`、`@@code`

1. `@@headers`: 头部参数

2. `@@params`: 查询参数

3. `@@query`: RESTFul 地址参数

4. `@@body`: 内容参数

`@@body` 与 `@@headers`、`@@query`、`@@params` 有些不同，其右侧内容可选，内容是对 body 做介绍的文档

5. `@@code`: 返回状态码

#### 参数

参数格式统一为 `@*prop-name {type} desc`，`@`的数量表示深度，可无限递归

#### parts

parts 的内容较为复杂，参考 [parts](###parts) 部分

### `docs` 属性赋值

`docs` 是 `ApiDocs` 对象

参考如下内容给 `Action` 实例对象的 `docs` 属性赋值：

```TS
    this.docs = {
      name: "get docs",
      desc: "a docs test named get",
      input: {
        headers: [
          {
            name: "test-header1",
            desc: "a test header of getting docs NO.1",
            type: "string",
          },
          {
            name: "test-header2",
            type: "number",
          },
          {
            name: "test-header3",
            desc: "a test header of getting docs NO.3",
            type: "object",
            children: [
              {
                name: "test-header31",
                desc: "a test header of getting docs NO.3.1",
                type: "string",
              },
              {
                name: "test-header32",
                desc: "a test header of getting docs NO.3.1",
                type: "number",
              },
            ],
          },
          {
            name: "test-header4",
            desc: "a test header of getting docs NO.4",
            type: "number",
          },
        ],
        body: {
          type: "string",
          desc: "http method",
        },
      },
      output: {
        codes: [
          {
            code: 200,
            desc: "success",
          },
          {
            code: 404,
          },
        ],
        body: [
          {
            name: "method",
            type: "string",
            desc: "http method",
          },
        ],
      },
      parts: ["test1", "test2", "custom"],
    };
```

其实 [action 注释](###action注释) 的方式最终会编译为 `ApiDocs` 对象，如果编写内容相同，则二者最终生成的文档也相同。

因此各属性的介绍与 [action 注释](###action注释) 的方式相同，此处不再赘述。

### @auth

为了简单化，`action` 注释或 `docs` 属性赋值的方式，字段 `parts` 值也可以为一个特殊值 `@auth`，此时这个 `Action` 的 `parts` 字段值将取自 `action.roles` 字段值。

更进一步，如果配置文件中的 `partsFromAuth` 属性值为 `true`，那么所有 `parts` 如果未设置值，都将取自 `action.roles` 属性值。（没有 `@input` 将忽略输入参数，没有 `@output` 将忽略输出参数 ）。

### 自动化文档配置文件

在 `sfa-router.json` 配置文件中，doc 字段即为自动化文档的相关配置，配置格式如下：

```JSON
{
  "doc": {
    "output": "../docs/api/README.md",
    "title": "@sfajs/router-title",
    "subtitle": "@sfajs/router-subtitle",
    "parts": [
      {
        "name": "part1",
        "inputHeaders": [
          {
            "name": "base-input-header",
            "desc": "this is a base input header",
            "type": "string"
          }
        ]
      },
      {
        "name": "part2",
        "outputHeaders": [
          {
            "name": "base-output-header",
            "desc": "this is a base output header",
            "type": "string"
          }
        ]
      },
      {
        "name": "part3",
        "query": [
          {
            "name": "base-query",
            "desc": "this is a base query",
            "type": "string"
          }
        ]
      }
    ],
    "partsFromAuth": true
  }
}
```

#### output

生成目标文件的相对路径

#### title

生成文档的标题

#### subtitle

生成文档的简介

#### parts

有些参数可能会被多个 API 使用，对于一个网站，可能大多数 API 都需要在头部传入`cookie`、`account`等。

利用 `parts` 功能可以重复使用某些参数。

每个 `part` 为一个`可配置项`

##### parts 配置

前面配置文件的 `parts` 属性值为`可配置项`数组。

每个`可配置项`格式如下：

```JSON
{
  "name": "custom",
  "query": [
    {
      "name": "base-query",
      "desc": "this is a base query",
      "type": "string"
    }
  ],
  "outputHeaders":[],
  "inputHeaders":[],
  "params":[],
  "codes":[]
}
```

其中 `name` 值为该配置项的标识，如果设置不正确会找不到该配置项

##### 注释中的格式

在注释中，parts 格式如：

```
@parts part1 part2
```

或取自 `auth` 属性值：

```
@parts @auth
```
