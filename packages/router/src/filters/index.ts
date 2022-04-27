import { isClass, ObjectConstructor } from "@sfajs/core";
import { Action } from "../action";
import { FILTERS_METADATA } from "../constant";
import { ActionFilter } from "./action.filter";
import { AuthorizationFilter } from "./authorization.filter";
import { ExceptionFilter } from "./exception.filter";
import { Filter, FilterItem } from "./filter";
import { ResourceFilter } from "./resource.filter";

export * from "./filter";
export * from "./action.filter";
export * from "./authorization.filter";
export * from "./exception.filter";
export * from "./resource.filter";

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
): (T | ObjectConstructor<T>)[] {
  const filters: Filter[] =
    Reflect.getMetadata(FILTERS_METADATA, action.constructor) ?? [];
  return filters.filter((item) => select(item)) as T[];
}
