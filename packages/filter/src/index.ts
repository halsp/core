import { execFilters, Filter, FilterItem, OrderRecord } from "./filters";
import {
  HookType,
  isClass,
  isUndefined,
  Middleware,
  ObjectConstructor,
  Startup,
} from "@halsp/core";
import { FILTERS_ORDER_BAG, GLOBAL_FILTERS_BAG, USE_FILTER } from "./constant";
import { Action } from "@halsp/router";
import "@halsp/inject";

export {
  Filter,
  FilterItem,
  ActionFilter,
  AuthorizationFilter,
  ExceptionFilter,
  ResourceFilter,
  execFilters,
} from "./filters";
export { UseFilters } from "./use-filters.decorator";

declare module "@halsp/core" {
  interface Startup {
    useFilter(): this;
    useGlobalFilter<T extends Filter = Filter>(
      filter: FilterItem<T>,
      order?: number,
    ): this;
    useFilterOrder<T extends Filter = Filter>(
      filter: ObjectConstructor<T>,
      order: number,
    ): this;
  }
}

Startup.prototype.useFilterOrder = function <T extends Filter = Filter>(
  filter: ObjectConstructor<T>,
  order: number,
) {
  return this.useFilter().use(async (ctx, next) => {
    const existOrders = ctx.get<OrderRecord<T>[]>(FILTERS_ORDER_BAG) ?? [];
    const orders = existOrders.filter((item) => item.filter != filter);
    orders.push({
      filter,
      order,
    });
    ctx.set(FILTERS_ORDER_BAG, orders);
    await next();
  });
};

Startup.prototype.useGlobalFilter = function <T extends Filter = Filter>(
  filter: FilterItem<T>,
  order?: number,
) {
  this.useFilter();

  if (order != undefined) {
    const cls = isClass(filter)
      ? filter
      : (filter.constructor as ObjectConstructor<T>);
    this.useFilterOrder(cls, order);
  }

  return this.use(async (ctx, next) => {
    const filters = ctx.get<FilterItem<T>[]>(GLOBAL_FILTERS_BAG) ?? [];
    filters.push(filter);
    ctx.set(GLOBAL_FILTERS_BAG, filters);
    await next();
  });
};

Startup.prototype.useFilter = function () {
  if (this[USE_FILTER]) {
    return this;
  }
  this[USE_FILTER] = true;

  return this.useInject()
    .hook(HookType.Error, async (ctx, md, err) => {
      if (!(md instanceof Action)) return false;

      const execResult = await execFilters(md, true, "onException", err);
      if (isUndefined(execResult)) return false;
      return execResult == true;
    })
    .hook<Middleware>(HookType.BeforeInvoke, async (ctx, md) => {
      if (!(md instanceof Action)) return;

      async function exec(funcName: string) {
        return await execFilters(md, true, funcName);
      }

      // authorization
      {
        const execResult = await exec("onAuthorization");
        if (execResult == false) return false;
      }

      // resource
      {
        const execResult = await exec("onResourceExecuting");
        if (execResult == false) return false;
      }

      // action
      {
        const execResult = await exec("onActionExecuting");
        if (execResult == false) return false;
      }

      return true;
    })
    .hook<Middleware>(HookType.AfterInvoke, async (ctx, md) => {
      if (!(md instanceof Action)) return;

      async function exec(funcName: string) {
        return await execFilters(md, false, funcName);
      }

      // action
      await exec("onActionExecuted");

      // resource
      await exec("onResourceExecuted");
    });
};
