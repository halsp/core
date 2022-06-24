import { execFilters, Filter, FilterItem, OrderRecord } from "./filters";
import {
  HookType,
  isClass,
  isUndefined,
  ObjectConstructor,
  Startup,
} from "@sfajs/core";
import { FILTERS_ORDER_BAG, GLOBAL_FILTERS_BAG, USE_FILTER } from "./constant";
import { Action } from "@sfajs/router";

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

declare module "@sfajs/core" {
  interface Startup {
    useFilter(): this;
    useGlobalFilter<T extends Filter = Filter>(
      filter: FilterItem<T>,
      order?: number
    ): this;
    useFilterOrder<T extends Filter = Filter>(
      filter: ObjectConstructor<T>,
      order: number
    ): this;
  }
}

Startup.prototype.useFilterOrder = function <T extends Filter = Filter>(
  filter: ObjectConstructor<T>,
  order: number
): Startup {
  return this.useFilter().use(async (ctx, next) => {
    const existOrders = ctx.bag<OrderRecord<T>[]>(FILTERS_ORDER_BAG) ?? [];
    const orders = existOrders.filter((item) => item.filter != filter);
    orders.push({
      filter,
      order,
    });
    ctx.bag(FILTERS_ORDER_BAG, orders);
    await next();
  });
};

Startup.prototype.useGlobalFilter = function <T extends Filter = Filter>(
  filter: FilterItem<T>,
  order?: number
): Startup {
  this.useFilter();

  if (order != undefined) {
    const cls = isClass(filter)
      ? filter
      : (filter.constructor as ObjectConstructor<T>);
    this.useFilterOrder(cls, order);
  }

  return this.use(async (ctx, next) => {
    const filters = ctx.bag<FilterItem<T>[]>(GLOBAL_FILTERS_BAG) ?? [];
    filters.push(filter);
    ctx.bag(GLOBAL_FILTERS_BAG, filters);
    await next();
  });
};

Startup.prototype.useFilter = function (): Startup {
  if (this[USE_FILTER]) {
    return this;
  }
  this[USE_FILTER] = true;

  return this.useInject()
    .hook(HookType.Exception, async (ctx, md, err) => {
      if (!(md instanceof Action)) return false;

      const execResult = await execFilters(md, true, "onException", err);
      if (isUndefined(execResult)) return false;
      return execResult;
    })
    .hook(HookType.BeforeInvoke, async (ctx, md) => {
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
    .hook(HookType.AfterInvoke, async (ctx, md) => {
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
