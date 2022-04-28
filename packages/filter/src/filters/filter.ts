import { isClass, ObjectConstructor } from "@sfajs/core";
import { Action } from "@sfajs/router";
import {
  FILTERS_METADATA,
  FILTERS_ORDER_BAG,
  GLOBAL_FILTERS_BAG,
} from "../constant";
import { ActionFilter } from "./action.filter";
import { AuthorizationFilter } from "./authorization.filter";
import { ExceptionFilter } from "./exception.filter";
import { ResourceFilter } from "./resource.filter";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Filter extends Object {}

export type FilterItem<T extends Filter = Filter> = T | ObjectConstructor<T>;

function testFunc(filter: FilterItem, ...fns: string[]): boolean {
  for (const fn of fns) {
    let func: any;
    if (isClass(filter)) {
      func = filter.prototype[fn];
    } else {
      func = filter[fn];
    }
    const existFunc = !!func && typeof func == "function";
    if (!existFunc) return false;
  }
  return true;
}

export function isActionFilter(
  filter: FilterItem
): filter is ActionFilter | ObjectConstructor<ActionFilter> {
  return testFunc(filter, "onActionExecuted", "onActionExecuting");
}

export function isAuthorizationFilter(
  filter: FilterItem
): filter is AuthorizationFilter | ObjectConstructor<AuthorizationFilter> {
  return testFunc(filter, "onAuthorization");
}

export function isExceptionFilter(
  filter: FilterItem
): filter is ExceptionFilter | ObjectConstructor<ExceptionFilter> {
  return testFunc(filter, "onException");
}

export function isResourceFilter(
  filter: FilterItem
): filter is ResourceFilter | ObjectConstructor<ResourceFilter> {
  return testFunc(filter, "onResourceExecuted", "onResourceExecuting");
}

export function getFilters<T extends Filter = Filter>(
  action: Action,
  select: (filter: Filter) => boolean
): FilterItem<T>[] {
  const useFilters: FilterItem<T>[] =
    Reflect.getMetadata(FILTERS_METADATA, action.constructor) ?? [];
  const globalFilters =
    action.ctx.bag<FilterItem<T>[]>(GLOBAL_FILTERS_BAG) ?? [];
  const orders = action.ctx.bag<OrderRecord<T>[]>(FILTERS_ORDER_BAG) ?? [];
  const filters: FilterItem<T>[] = [...globalFilters, ...useFilters];
  return filters
    .filter((item) => select(item))
    .sort((f1, f2) => {
      const cls1 = isClass(f1) ? f1 : (f1.constructor as ObjectConstructor<T>);
      const cls2 = isClass(f2) ? f2 : (f2.constructor as ObjectConstructor<T>);

      const order1 = orders.filter((item) => item.filter == cls1)[0]?.order;
      const order2 = orders.filter((item) => item.filter == cls2)[0]?.order;

      if (order1 == undefined && order2 == undefined) {
        return 0;
      } else if (order1 == undefined && order2 != undefined) {
        return 1;
      } else if (order1 != undefined && order2 == undefined) {
        return -1;
      } else {
        return order1 - order2;
      }
    });
}

export interface OrderRecord<T extends Filter = Filter> {
  filter: ObjectConstructor<T>;
  order: number;
}
