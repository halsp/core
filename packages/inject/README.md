# @sfajs/inject

借助 `@sfajs/inject` 你可以实现 `sfa` 的 依赖注入 / 控制反转

你需要使用装饰器以使用此功能

在任意类的字段使用 `@Inject` 装饰器后，该类的实例对象将可以作为 `服务` 使用，你可以在中间件中使用此服务，也可以在其他服务中使用此服务

## 快速开始

```TS
import "@sfajs/inject";
startup.useInject();
```

```TS
import "@sfajs/inject";
import { Inject } from "@sfajs/inject";
import { Middleware } from "@sfajs/core";

class OtherService(){}

class TestService{
  @Inject
  private readonly otherService!: OtherService;
}

class TestMiddleware extends Middleware {
  @Inject
  private readonly testService!: TestService;

  async invoke(): Promise<void> {
    this.ok({
      service: this.testService.constructor.name,
    });
  }
}

const res = await new TestStartup().useInject().add(TestMiddleware).run();
```

上述代码中的 `useInject` 会启用依赖注入

需要注意的是，依赖注入只会在 `useInject` 之后的中间件中生效，因此你需要把 `useInject` 放在靠前的位置，根据实际项目决定

## `@Inject` 字段初始化时机

被 `@Inject` 装饰的字段会自动初始化并赋值，初始化的时机有两种：

- 中间件：在 `invoke` 函数被执行前会初始化 `@Inject` 装饰的字段
- 其他类：在类构造函数执行完毕后立即初始化 `@Inject` 装饰的字段

## 注册服务

没有被注册的服务，会自动实例化字段对应的类，如

```TS
class TestMiddleware extends Middleware {
  @Inject
  private readonly testService!: TestService;
}
```

`testService` 字段值为 `new TestService()`，如果 `TestService` 类没有无参的构造函数，可能会出错

你也可以指定注册的服务，以实现控制反转

```TS
import "@sfajs/inject";
startup.inject(IService, Service);
startup.inject(IService, new Service());
```

需要注意的是， `inject` 作用于其后的中间件，因此你需要在靠前的位置注册服务

## 作用域

依赖注入服务的作用域分为三种

1. Singleton：单例，nodejs 运行期间只初始化一次，即同时只会存在一个对象
2. Scoped：单次访问，每次网络访问会初始化一次，每次网络访问结束后此对象会被丢弃
3. Transient：瞬时，每处服务都会被单独初始化

```TS
import "@sfajs/inject";
import { InjectTypes } "@sfajs/inject";

startup.inject(IService, Service, InjectTypes.Singleton);
startup.inject(IService, Service, InjectTypes.Scoped);
startup.inject(IService, Service, InjectTypes.Transient);
```

## 服务的嵌套

嵌套的服务也能被正确初始化

```TS
class TestService1(){}

class TestService2{
  @Inject
  private readonly service1!: TestService1;
}

class TestService3{
  @Inject
  private readonly service1!: TestService1;

  @Inject
  service2!: TestService2;
}

class TestMiddleware extends Middleware{
  @Inject
  private readonly service1!: TestService1;

  @Inject
  private readonly service2!: TestService2;

  @Inject
  private readonly service3!: TestService3;
}
```
