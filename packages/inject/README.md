# @sfajs/inject

借助 `@sfajs/inject` 你可以实现 `sfa` 的 依赖注入 / 控制反转

你需要开启装饰器功能以使用此功能

装饰器有两种方式：

1. 在字段声明时使用装饰器 `@Inject`，`@sfajs/inject` 将在特定时机注入对应服务
2. 在类声明时使用装饰器 `@Inject`，并在类构造函数中声明服务，`@sfajs/inject` 会在初始化类时注入对应服务

使用 `@Inject` 的类的实例对象将可以作为 `服务` 使用，你可以在中间件中使用此服务，也可以在其他服务中使用此服务

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

`testService` 字段值将自动被实例化

`TestService` 类构造函数的参数，也可以自动初始化

你也可以指定注册的服务，以实现控制反转

```TS
import "@sfajs/inject";

startup.inject(IService, Service);
// OR
startup.inject(IService, new Service()); // Singleton only
// OR
startup.inject(IService, async (ctx) => await createService(ctx));
```

需要注意的是， `inject` 作用于其后的中间件，因此你需要在靠前的位置注册服务

## 键值注入

可以指定 key 注入服务

```TS
import "@sfajs/inject";

startup.inject("SERVICE_KEY", Service);
// OR
startup.inject("SERVICE_KEY", new Service()); // Singleton only
// OR
startup.inject("SERVICE_KEY", async (ctx) => await createService(ctx));
```

```TS
class TestMiddleware extends Middleware {
  @Inject("SERVICE_KEY")
  private readonly testService!: TestService;
}
```

甚至可以注入常量值

```TS
startup.inject("KEY1", true);
startup.inject("KEY2", "str");
startup.inject("KEY3", 2333);
```

```TS
class TestMiddleware extends Middleware {
  @Inject("KEY1")
  private readonly key1!: boolean; // true
  @Inject("KEY2")
  private readonly key2!: any; // "str"
  @Inject("KEY3")
  private readonly key3!: number; // 2333
}
```

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

## 类装饰器

你也可以用 @Inject 装饰一个类，这样你就可以在类构造函数中取到服务

构造函数中也可以使用键值注入参数

```TS
import "@sfajs/inject";
import { Inject } from "@sfajs/inject";
import { Middleware } from "@sfajs/core";

class OtherService(){}

@Inject
class TestService{
  constructor(
    readonly otherService: OtherService,
    @Inject("KEY1") private readonly params1: number
  ){}
}

@Inject
class TestMiddleware extends Middleware {
  constructor(
    private readonly testService: TestService, // TestService object
    @Inject("KEY1") private readonly params1: number, // 2333
    @Inject("KEY2") private readonly params2: any // true
  ){
    super();
  }

  async invoke(): Promise<void> {
    this.ok({
      service: this.testService.constructor.name,
      params1: this.params1,
      params2: this.params2
    });
  }
}

const res = await new TestStartup()
  .useInject()
  .inject("KEY1", 2333)
  .inject("KEY2", true)
  .add(TestMiddleware)
  .run();
```

需要注意的是，添加的中间件必须是中间件的构造器

```TS
setup.add(YourMiddleware)
```

因此下面添加中间件的方式，将不能使用类装饰器

```TS
setup.add(async (ctx, next)=>{})
setup.add(new YourMiddleware())
setup.add(()=> new YourMiddleware())
setup.add(async ()=> await Factory.creatMiddleware())
```

## 手动注入服务

有些服务可能没有写在其他服务中，也没有写在中间件中，就无法自动注入服务，需要手动注入服务

`@sfajs/inject` 也支持手动注入服务，有两种方式注入

1. 你可以先创建对象再注入服务

```TS
import { parseInject } from '@sfajs/inject'

const service = new Service();
await parseInject(ctx, service);

// OR
const service = await parseInject(ctx, new Service());
```

但是这种方式无法实例化 `服务写在构造函数中` 的类，仅可注入实例对象字段的服务

2. 也可以利用控制反转注入服务

```TS
import { parseInject } from '@sfajs/inject'

const service = await parseInject(ctx, Service);
```

这种方式可以同时实例化属性服务或构造器服务
