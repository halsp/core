import { Action } from "../action";
import { FILTERS_METADATA } from "../constant";
import { ActionFilter } from "./action.filter";
import { AuthorizationFilter } from "./authorization.filter";
import { ExceptionFilter } from "./exception.filter";
import { Filter } from "./filter";
import { ResourceFilter } from "./resource.filter";

export * from "./filter";
export * from "./action.filter";
export * from "./authorization.filter";
export * from "./exception.filter";
export * from "./resource.filter";

export function isActionFilter(filter: Filter): filter is ActionFilter {
  return !!filter["onActionExecuted"] && !!filter["onActionExecuting"];
}

export function isAuthorizationFilter(
  filter: Filter
): filter is AuthorizationFilter {
  return !!filter["onAuthorization"];
}

export function isExceptionFilter(filter: Filter): filter is ExceptionFilter {
  return !!filter["onException"];
}

export function isResourceFilter(filter: Filter): filter is ResourceFilter {
  return !!filter["onResourceExecuted"] && !!filter["onResourceExecuting"];
}

export function getFilters<T extends Filter = Filter>(
  action: Action,
  select: (filter: Filter) => boolean
) {
  const filters: Filter[] = Reflect.getMetadata(FILTERS_METADATA, action) ?? [];
  return filters.filter((item) => select(item)) as T[];
}
