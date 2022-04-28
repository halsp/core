import "reflect-metadata";
import {
  CUSTOM_FILTER_EXECUTED_METADATA,
  CUSTOM_FILTER_EXECUTING_METADATA,
  CUSTOM_FILTER_METADATA,
} from "./constant";

export enum CustomFilterType {
  BeforeAuthorization,
  BeforeResource,
  BeforeAction,
  Last,
}

export function CustomFilter(type: CustomFilterType): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(CUSTOM_FILTER_METADATA, type, target);
  };
}

export function CustomFilterExecuting(
  target: any,
  propertyKey: string | symbol
) {
  Reflect.defineMetadata(CUSTOM_FILTER_EXECUTING_METADATA, propertyKey, target);
}

export function CustomFilterExecuted(
  target: any,
  propertyKey: string | symbol
) {
  Reflect.defineMetadata(CUSTOM_FILTER_EXECUTED_METADATA, propertyKey, target);
}
