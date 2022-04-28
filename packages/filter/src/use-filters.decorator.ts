import { FilterItem } from "./filters/filter";
import "reflect-metadata";
import { FILTERS_METADATA } from "./constant";

export function UseFilters(...filters: FilterItem[]): ClassDecorator {
  return (target: any) => {
    const existFilters: FilterItem[] =
      Reflect.getMetadata(FILTERS_METADATA, target) ?? [];
    existFilters.push(...filters);
    Reflect.defineMetadata(FILTERS_METADATA, existFilters, target);
  };
}
