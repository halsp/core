# @sfajs/filter

基于 `@sfajs/router` 的请求过滤器

`@sfajs/filter` 提供以下几种过滤器

- ActionFilter: Action 运行前和运行后执行，比较通用，可以改变传入内容和返回结果，可以用于统一返回
- AuthorizationFilter: Action 运行前执行，一般用于身份认证
- ResourceFilter: Action 运行前和运行后执行，一般用于资源缓存
- ExceptionFilter: Action 运行抛出异常时执行，一般用于自定义异常处理

## 引入过滤器

以下三者调用任意一个都可以

- useFilter
- useGlobalFilter
- useFilterOrder

如

```TS
import "@sfajs/filter"

startup.useFilter()
// OR
startup.useGlobalFilter(YourFilter, 1)
```

需要在 `startup.useRouter` 之前引入

如果使用过滤器依赖注入，需要在 `startup.useInject` 引入

```TS
import "@sfajs/filter"
import "@sfajs/router"
import "@sfajs/inject"

startup
  // .use(...)
  .useInject()
  // .use(...)
  .useFilter()
  // .use(...)
  .useRouter()
```


## 在 Action 上使用过滤器

可以单独为某个 Action 使用过滤器

用装饰器的方式添加过滤器

```TS
@UseFilters(...filters)
export default class extends Action{
  invoke(){}
}
```

## 全局过滤器

用以下函数添加过滤器

```TS
startup.useGlobalFilter(filter)
```

注意此函数应在 `useRouter` 之前调用

可以调用多次，每次都会添加一个全局过滤器

## 依赖注入

过滤器支持 `@sfajs/inject` 依赖注入

使用过滤器时，建议传入类而不是对象，可以让框架自动初始化过滤器

## 执行顺序

`ExceptionFilter` 过滤器是抛出异常立即执行

其他过滤器按以下顺序执行

1. AuthorizationFilter
2. ResourceFilter.onResourceExecuting
3. ActionFilter.onActionExecuting
4. Action Middleware
5. ActionFilter.onActionExecuted
6. ResourceFilter.onResourceExecuted

### 同类型执行顺序

同类型过滤器的执行顺序默认按以下顺序执行

- 全局优先于局部装饰器
- 全局之间按引入顺序执行
- 局部之间按引入顺序执行

### 指定执行顺序

可以指定同类型过滤器的执行顺序

```TS
startup.useFilterOrder(FilterConstructor, order)
```

如果是全局过滤器，也可以传入 `useGlobalFilter` 第二个顺序参数

```TS
startup.useGlobalFilter(Filter, order)
```
