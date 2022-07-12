import { isClass, ObjectConstructor } from "@ipare/core";
import { parseInject } from "@ipare/inject";
import { Action } from "@ipare/router";
import {
  FILTERS_METADATA,
  FILTERS_ORDER_BAG,
  GLOBAL_FILTERS_BAG,
} from "../constant";
import { Filter, FilterItem, OrderRecord } from "./filter";

export async function execFilters(
  action: Action,
  isExecuting: true,
  funcName: string,
  ...params: any[]
): Promise<boolean | void>;
export async function execFilters(
  action: Action,
  isExecuting: false,
  funcName: string,
  ...params: any[]
): Promise<void>;
export async function execFilters(
  action: Action,
  isExecuting: boolean,
  funcName: string,
  ...params: any[]
): Promise<boolean | void> {
  const filters = getFilters(action, isExecuting, (filter) => {
    let func: any;
    if (isClass(filter)) {
      func = filter.prototype[funcName];
    } else {
      func = filter[funcName];
    }
    return !!func && typeof func == "function";
  });
  if (!filters.length) {
    return undefined;
  }

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
  select: (filter: FilterItem<T>) => boolean
): FilterItem<T>[] {
  const useFilters: FilterItem<T>[] =
    Reflect.getMetadata(FILTERS_METADATA, action.constructor) ?? [];
  const globalFilters =
    action.ctx.bag<FilterItem<T>[]>(GLOBAL_FILTERS_BAG) ?? [];
  const orders = action.ctx.bag<OrderRecord<T>[]>(FILTERS_ORDER_BAG) ?? [];
  const filters: FilterItem<T>[] = [...globalFilters, ...useFilters];
  if (!isExecuting) filters.reverse();
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
