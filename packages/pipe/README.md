# @sfajs/req-deco

通过装饰器便捷使用接口参数

你需要使用装饰器以使用此功能

用 `Query`, `Header`, `Param`, `Body`, `Ctx` 装饰字段，该字段在特定生命周期会被自动赋值
用 `ReqParse` 装饰字段，该字段的值为实例对象，该对象中被装饰的字段同样会被自动赋值

## 快速开始

```TS
import "@sfajs/req-parse";
startup.useReqParse();
```

```TS
import "@sfajs/req-parse";
import { Header, Query, Param, Body, Ctx } from "@sfajs/req-parse";
import { Middleware, ReadonlyDict, TestStartup, HttpContext } from "@sfajs/core";

class TestMiddleware extends Middleware {
  @Ctx
  private readonly ctx1!: HttpContext;
  @Header
  private readonly header!: ReadonlyDict;
  @Query
  private readonly query1!: ReadonlyDict;
  @Query
  private readonly query2!: ReadonlyDict;
  @Param
  private readonly params!: ReadonlyDict;
  @Body
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

## 嵌套使用 `ReqParse`

用 `@ReqParse` 装饰的字段，如果没有初始化，将会被自动初始化

该字段的值是一个对象，其字段也可以使用 `Query`, `Header` 等装饰并被自动赋值，当然也可以用 `@ReqParse` 来嵌套初始化

```TS
class TestClass1 {
  @Header
  private readonly header!: any;
}

class TestClass2 {
  @Query("query1")
  private readonly query1!: string;
  @ReqParse
  class: TestClass1;
}

class TestMiddleware extends Middleware {
  @Query("query1")
  private readonly query1!: string;
  @ReqParse
  class1 = new TestClass1();
  @ReqParse
  class2: TestClass1;
}

const res = await new TestStartup()
    .useReqParse()
    .add(TestMiddleware)
    .run();
```

## 其他服务

## 在其他类中

在其他任意类中，你也可以手动使用 `@sfajs/req-parse`

```TS
import { HttpContext } from "@sfajs/core";
import { parseReqDeco, Header, Query, Ctx } from "@sfajs/req-parse";

class TestClass {
  @Ctx
  private readonly ctx!: HttpContext;
  @Header
  private readonly header!: any;
  @Query("property")
  private readonly query!: any;
}

const obj = parseReqDeco(TestClass); // 需要无参构造函数
// OR
const obj = parseReqDeco(new TestClass());
```

## 避免在单例类中使用

由于每次接口请求，参数可能都会变

因此使用装饰器的类，其实例对象必须仅作用于单次网络访问

例如不能使用单例类或单例中间件，否则可能会在高并发下出现不可预知的问题

在这样的中间件中不能使用 `@sfajs/req-parse`，因为中间件是单例的：

```TS
startup.use(new YourMiddleware())
```

```TS
const md = new YourMiddleware();
startup.use((ctx) => md);
```
