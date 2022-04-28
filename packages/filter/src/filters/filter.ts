import { isClass, ObjectConstructor } from "@sfajs/core";
import { parseInject } from "@sfajs/inject";
import { Action } from "@sfajs/router";
import {
  CUSTOM_FILTER_METADATA,
  FILTERS_METADATA,
  FILTERS_ORDER_BAG,
  GLOBAL_FILTERS_BAG,
} from "../constant";
import {
  CustomFilterOption,
  CustomFilterOrder,
} from "../custom-filter.decorator";
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

function getCustomOptions<T extends Filter = Filter>(filter: T) {
  const cons = isClass(filter)
    ? filter
    : (filter.constructor as ObjectConstructor<T>);
  return Reflect.getMetadata(
    CUSTOM_FILTER_METADATA,
    cons
  ) as CustomFilterOption;
}

function isCustomFilter<T extends Filter = Filter>(
  filter: FilterItem,
  order: CustomFilterOrder,
  executing: boolean
): filter is T | ObjectConstructor<T> {
  const options = getCustomOptions(filter);
  if (!options) return false;
  if (options.order != order) return false;
  if (executing && !options.executing) return false;
  if (!executing && !options.executed) return false;

  const testFuncs: string[] = [];
  if (options.executed) testFuncs.push(options.executed);
  if (options.executing) testFuncs.push(options.executing);
  return testFunc(filter, ...testFuncs);
}

export async function execCustomFilters(
  action: Action,
  order: CustomFilterOrder,
  executing: true
): Promise<boolean>;
export async function execCustomFilters(
  action: Action,
  order: CustomFilterOrder,
  executing: false
): Promise<undefined>;
export async function execCustomFilters(
  action: Action,
  order: CustomFilterOrder,
  executing: boolean
): Promise<boolean | undefined> {
  const filters = getFilters<Filter>(action, "asc", (filter) =>
    isCustomFilter(filter, order, executing)
  );
  for (const filter of filters) {
    const options = getCustomOptions(filter);
    const obj = await parseInject(action.ctx, filter);
    const func = executing ? options.executing : options.executed;
    const execResult = await obj[func as string](action.ctx);
    if (executing && typeof execResult == "boolean" && !execResult) {
      return false;
    }
  }
  if (executing) {
    return true;
  }
}

export function getFilters<T extends Filter = Filter>(
  action: Action,
  orderBy: "asc" | "desc",
  select: (filter: Filter) => boolean
): FilterItem<T>[] {
  const useFilters: FilterItem<T>[] =
    Reflect.getMetadata(FILTERS_METADATA, action.constructor) ?? [];
  const globalFilters =
    action.ctx.bag<FilterItem<T>[]>(GLOBAL_FILTERS_BAG) ?? [];
  const orders = action.ctx.bag<OrderRecord<T>[]>(FILTERS_ORDER_BAG) ?? [];
  const filters: FilterItem<T>[] =
    orderBy == "asc"
      ? [...globalFilters, ...useFilters]
      : [...useFilters, ...globalFilters];
  return filters
    .filter((item) => select(item))
    .sort((f1, f2) => {
      const cls1 = isClass(f1) ? f1 : (f1.constructor as ObjectConstructor<T>);
      const cls2 = isClass(f2) ? f2 : (f2.constructor as ObjectConstructor<T>);

      const order1 = orders.filter((item) => item.filter == cls1)[0]?.order;
      const order2 = orders.filter((item) => item.filter == cls2)[0]?.order;

      let result: number;
      if (order1 == undefined && order2 == undefined) {
        result = 0;
      } else if (order1 == undefined && order2 != undefined) {
        result = 1;
      } else if (order1 != undefined && order2 == undefined) {
        result = -1;
      } else {
        result = order1 - order2;
      }
      if (orderBy == "desc") {
        result = -result;
      }
      return result;
    });
}

export interface OrderRecord<T extends Filter = Filter> {
  filter: ObjectConstructor<T>;
  order: number;
}
