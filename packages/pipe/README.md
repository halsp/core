# @sfajs/req-deco

基于 `@sfajs/inject` 通过装饰器便捷使用接口参数

你需要使用装饰器并引入 `@sfajs/inject` 以使用此功能

用 `Query`, `Header`, `Param`, `Body`, `Context` 装饰字段，该字段在特定生命周期会被自动赋值

## 快速开始

```TS
import "@sfajs/inject";
import { Header, Query, Param, Body, Context } from "@sfajs/req-deco";
import { Middleware, ReadonlyDict, TestStartup, HttpContext } from "@sfajs/core";

class TestMiddleware extends Middleware {
  @Context
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
    .useInject()
    .add(TestMiddleware)
    .run();
```

上述代码中的 `useInject` 会启用依赖注入，`@sfajs/req-deco` 利用依赖注入实现功能

需要注意的是，该功能只会在 `useInject` 之后的中间件中生效，因此你需要把 `useInject` 放在靠前的位置，根据实际项目决定

## 在其他类中

在其他任意类中，你也可以利用控制反转实现实例化

```TS
import { parseInject } from "@sfajs/inject";
import { HttpContext } from "@sfajs/core";
import { Header, Query, Context } from "@sfajs/req-deco";

class TestClass {
  @Context
  private readonly ctx!: HttpContext;
  @Header
  private readonly header!: any;
  @Query("property")
  private readonly query!: any;
}

const obj = parseInject(TestClass); // 利用控制反转创建对象
// OR
const obj = parseInject(new TestClass());
```

## 避免在单例类中使用

由于每次接口请求，参数可能都会变

因此使用装饰器的类，其实例对象必须仅作用于单次网络访问

例如不能使用单例类或单例中间件，否则可能会在高并发下出现不可预知的问题

在这样的中间件中不能使用 `@sfajs/req-deco`，因为中间件是单例的：

```TS
startup.use(new YourMiddleware())
```

```TS
const md = new YourMiddleware();
startup.use((ctx) => md);
```

## 管道 pipe

利用管道可以实现参数校验、参数转换等

此处管道不同于管道上下文 `HttpContext`

### 用法

`Header`,`Query` 等装饰器参数可以接收管道对象或类

如果传入的是管道的类，可以利用控制反转自动实例化管道

传入类

```TS
import { Query, ParseIntPipe } from "@sfajs/req-deco"

@Query("field", ParseIntPipe)
queryField: number;
```

或传入对象

```TS
@Query("field", new ParseIntPipe())
queryField: number;
```

或转换整个 query

```TS
@Query(ParseIntPipe)
query: any;
```

### 内置管道

目前内置的管道有

- ParseIntPipe
- ParseFloatPipe
- ParseBoolPipe

### 自定义管道

更多需求可以自定义管道

创建一个类，实现 `PipeTransform` 接口，如

```TS
import { Context, PipeTransform } from "@sfajs/req-deco"

class ToStringPipe implements PipeTransform<any, string> {
  @Context
  readonly ctx: HttpContext;

  transform(value: any) {
    return "" + value;
  }
}
```
