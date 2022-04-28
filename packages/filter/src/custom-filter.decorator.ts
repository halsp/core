import "reflect-metadata";
import { CUSTOM_FILTER_METADATA } from "./constant";

export interface CustomFilterOption {
  executing?: string;
  executed?: string;
  order: CustomFilterOrder;
}

export enum CustomFilterOrder {
  BeforeAuthorization,
  BeforeResource,
  BeforeAction,
  AfterAction,
}

export function CustomFilter(options: CustomFilterOption): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(CUSTOM_FILTER_METADATA, options, target);
  };
}
