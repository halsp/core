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
import { Filter, FilterItem, OrderRecord } from "./filter";

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
  isExecuting: true
): Promise<boolean>;
export async function execCustomFilters(
  action: Action,
  order: CustomFilterOrder,
  isExecuting: false
): Promise<void>;
export async function execCustomFilters(
  action: Action,
  order: CustomFilterOrder,
  isExecuting: boolean
): Promise<boolean | void> {
  const filters = getFilters<Filter>(action, isExecuting, (filter) =>
    isCustomFilter(filter, order, isExecuting)
  );
  for (const filter of filters) {
    const options = getCustomOptions(filter);
    const obj = await parseInject(action.ctx, filter);
    const func = isExecuting ? options.executing : options.executed;
    const execResult = await obj[func as string](action.ctx);
    if (isExecuting && typeof execResult == "boolean" && !execResult) {
      return false;
    }
  }
  if (isExecuting) {
    return true;
  }
}

export async function execBuildinFilters(
  action: Action,
  isExecuting: true,
  funcName: string,
  ...params: any[]
): Promise<boolean>;
export async function execBuildinFilters(
  action: Action,
  isExecuting: false,
  funcName: string,
  ...params: any[]
): Promise<void>;
export async function execBuildinFilters(
  action: Action,
  isExecuting: boolean,
  funcName: string,
  ...params: any[]
): Promise<boolean | void> {
  const filters = getFilters(action, isExecuting, (filter) =>
    testFunc(filter, funcName)
  );
  for (const filter of filters) {
    const obj = await parseInject(action.ctx, filter);
    const execResult = await obj[funcName](action.ctx, ...params);
    if (isExecuting && typeof execResult == "boolean" && !execResult) {
      return false;
    }
  }
  if (isExecuting) {
    return true;
  }
}

function getFilters<T extends Filter = Filter>(
  action: Action,
  isExecuting: boolean,
  select: (filter: Filter) => boolean
): FilterItem<T>[] {
  const useFilters: FilterItem<T>[] =
    Reflect.getMetadata(FILTERS_METADATA, action.constructor) ?? [];
  const globalFilters =
    action.ctx.bag<FilterItem<T>[]>(GLOBAL_FILTERS_BAG) ?? [];
  const orders = action.ctx.bag<OrderRecord<T>[]>(FILTERS_ORDER_BAG) ?? [];
  const filters: FilterItem<T>[] = isExecuting
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
      if (!isExecuting) {
        result = -result;
      }
      return result;
    });
}
