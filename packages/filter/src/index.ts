import {
  execCustomFilters,
  execBuildinFilters,
  Filter,
  FilterItem,
  OrderRecord,
} from "./filters";
import { HookType, isClass, ObjectConstructor, Startup } from "@sfajs/core";
import { FILTERS_ORDER_BAG, GLOBAL_FILTERS_BAG, USE_FILTER } from "./constant";
import { Action } from "@sfajs/router";
import { CustomFilterOrder } from "./custom-filter.decorator";

export {
  Filter,
  FilterItem,
  ActionFilter,
  AuthorizationFilter,
  ExceptionFilter,
  ResourceFilter,
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

      return await execBuildinFilters(md, true, "onException", err);
    })
    .hook(HookType.BeforeInvoke, async (ctx, md) => {
      if (!(md instanceof Action)) return;

      async function execCustom(order: CustomFilterOrder) {
        return await execCustomFilters(md, order, true);
      }

      async function execBuildin(funcName: string) {
        return await execBuildinFilters(md, true, funcName);
      }

      // custom before authorization
      {
        const execResult = await execCustom(CustomFilterOrder.BeforeAction);
        if (!execResult) return false;
      }

      // authorization
      {
        const execResult = await execBuildin("onAuthorization");
        if (!execResult) return false;
      }

      // custom before resource
      {
        const execResult = await execCustom(CustomFilterOrder.BeforeResource);
        if (!execResult) return false;
      }

      // resource
      {
        const execResult = await execBuildin("onResourceExecuting");
        if (!execResult) return false;
      }

      // custom before action
      {
        const execResult = await execCustom(CustomFilterOrder.BeforeAction);
        if (!execResult) return false;
      }

      // action
      {
        const execResult = await execBuildin("onActionExecuting");
        if (!execResult) return false;
      }

      // custom after action
      {
        const execResult = await execCustom(CustomFilterOrder.AfterAction);
        if (!execResult) return false;
      }

      return true;
    })
    .hook(HookType.AfterInvoke, async (ctx, md) => {
      if (!(md instanceof Action)) return;

      async function execCustom(order: CustomFilterOrder) {
        return await execCustomFilters(md, order, false);
      }
      async function execBuildin(funcName: string) {
        return await execBuildinFilters(md, false, funcName);
      }

      // custom after action
      await execCustom(CustomFilterOrder.AfterAction);

      // action
      await execBuildin("onActionExecuted");

      // custom after action
      await execCustom(CustomFilterOrder.BeforeAction);

      // resource
      await execBuildin("onResourceExecuted");

      // custom before resource
      await execCustom(CustomFilterOrder.BeforeResource);

      // custom before authorization
      await execCustom(CustomFilterOrder.BeforeAuthorization);
    });
};
