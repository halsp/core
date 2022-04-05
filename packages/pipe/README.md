# @sfajs/req-deco

通过装饰器便捷使用接口参数

你需要使用装饰器以使用此功能

在类中间件中，你可以用 `Query`, `Header`, `Param`, `Body` 装饰字段，该字段在中间件执行 `invoke` 前会被自动赋值

## 快速开始

```TS
import "@sfajs/req-parse";
startup.useReqParse();
```

```TS
import "@sfajs/req-parse";
import { Header, Query, Param, Body } from "@sfajs/req-parse";
import { Middleware, ReadonlyDict, TestStartup } from "@sfajs/core";

class TestMiddleware extends Middleware {
  @Header()
  private readonly header!: ReadonlyDict;
  @Query()
  private readonly query1!: ReadonlyDict;
  @Query()
  private readonly query2!: ReadonlyDict;
  @Param()
  private readonly params!: ReadonlyDict;
  @Body()
  private readonly body!: ReadonlyDict;
  @Body("array")
  private readonly arrayFieldBody!: string;
  @Query("q")
  private readonly queryProperty!: string;

  async invoke(): Promise<void> {
    this.ok({
      header: this.header,
      query1: this.query1,
      query2: this.query2,
      params: this.params,
      body: this.body,
      arrayFieldBody: this.arrayFieldBody,
      queryProperty: this.queryProperty,
    });
  }
}

const res = await new TestStartup()
    .useReqParse()
    .add(TestMiddleware)
    .run();
```

上述代码中的 `useReqParse` 会启用该功能

需要注意的是，该功能只会在 `useReqParse` 之后的中间件中生效，因此你需要把 `useReqParse` 放在靠前的位置，根据实际项目决定

## 在其他类中

在其他任意类中，你也可以手动使用 `@sfajs/req-parse`

```TS
import { parseReqDeco, Header, Query } from "@sfajs/req-parse";

class TestClass {
  @Header()
  private readonly header!: any;
  @Query("property")
  private readonly query!: any;
}

const obj = parseReqDeco(TestClass); // 需要无参构造函数
// OR
const obj = parseReqDeco(new TestClass());
```
