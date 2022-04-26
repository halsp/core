import { Filter } from "../filters/filter";
import "reflect-metadata";
import { FILTERS_METADATA } from "../constant";

export function UseFilters(...filters: Filter[]): ClassDecorator {
  return (target: any) => {
    const existFilters: Filter[] =
      Reflect.getMetadata(FILTERS_METADATA, target) ?? [];
    existFilters.push(...filters);
    Reflect.defineMetadata(FILTERS_METADATA, existFilters, target);
  };
}
