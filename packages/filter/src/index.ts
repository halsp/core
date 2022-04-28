import {
  ActionFilter,
  AuthorizationFilter,
  ExceptionFilter,
  Filter,
  FilterItem,
  getFilters,
  isActionFilter,
  isAuthorizationFilter,
  isExceptionFilter,
  isResourceFilter,
  OrderRecord,
  ResourceFilter,
} from "./filters";
import { HookType, isClass, ObjectConstructor, Startup } from "@sfajs/core";
import { FILTERS_ORDER_BAG, GLOBAL_FILTERS_BAG, USE_FILTER } from "./constant";
import { Action } from "@sfajs/router";
import { parseInject } from "@sfajs/inject";

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

      const filters = getFilters<ExceptionFilter>(md, "asc", isExceptionFilter);
      for (const filter of filters) {
        const obj = await parseInject(ctx, filter);
        const execResult = await obj.onException(ctx, err);
        if (typeof execResult == "boolean" && execResult) {
          return true;
        }
      }
      return false;
    })
    .hook(HookType.BeforeInvoke, async (ctx, md) => {
      if (!(md instanceof Action)) return;

      {
        const filters = getFilters<AuthorizationFilter>(
          md,
          "asc",
          isAuthorizationFilter
        );
        for (const filter of filters) {
          const obj = await parseInject(ctx, filter);
          const execResult = await obj.onAuthorization(ctx);
          if (typeof execResult == "boolean" && !execResult) {
            return false;
          }
        }
      }

      {
        const filters = getFilters<ResourceFilter>(md, "asc", isResourceFilter);
        for (const filter of filters) {
          const obj = await parseInject(ctx, filter);
          const execResult = await obj.onResourceExecuting(ctx);
          if (typeof execResult == "boolean" && !execResult) {
            return false;
          }
        }
      }

      {
        const filters = getFilters<ActionFilter>(md, "asc", isActionFilter);
        for (const filter of filters) {
          const obj = await parseInject(ctx, filter);
          const execResult = await obj.onActionExecuting(ctx);
          if (typeof execResult == "boolean" && !execResult) {
            return false;
          }
        }
      }

      return true;
    })
    .hook(HookType.AfterInvoke, async (ctx, md) => {
      if (!(md instanceof Action)) return;

      {
        const filters = getFilters<ActionFilter>(md, "desc", isActionFilter);
        for (const filter of filters) {
          const obj = await parseInject(ctx, filter);
          await obj.onActionExecuted(ctx);
        }
      }

      {
        const filters = getFilters<ResourceFilter>(
          md,
          "desc",
          isResourceFilter
        );
        for (const filter of filters) {
          const obj = await parseInject(ctx, filter);
          await obj.onResourceExecuted(ctx);
        }
      }
    });
};
