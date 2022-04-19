import { HttpContext, ObjectConstructor } from "@sfajs/core";
import {
  PROPERTY_METADATA,
  CLASS_METADATA,
  KEY_METADATA,
  CUSTOM_METADATA,
} from "./constant";
import { CustomInjectItem } from "./custom-inject-item";
import { InjectKey } from "./inject-key";
import { InjectType } from "./inject-type";

export function Inject(key: string): PropertyDecorator & ParameterDecorator;
export function Inject(target: any): void;
export function Inject(target: any, propertyKey: string | symbol): void;
export function Inject(
  target: any,
  propertyKey?: string | symbol
): void | PropertyDecorator | ParameterDecorator {
  if (propertyKey) {
    const args =
      (Reflect.getMetadata(PROPERTY_METADATA, target) as (string | symbol)[]) ??
      [];
    args.push(propertyKey);
    Reflect.defineMetadata(PROPERTY_METADATA, args, target);
  } else if (typeof target == "string") {
    const injectKey = target;
    return function (
      target: any,
      propertyKey: string | symbol,
      parameterIndex?: number
    ) {
      const args =
        (Reflect.getMetadata(KEY_METADATA, target) as InjectKey[]) ?? [];
      args.push({
        key: injectKey,
        property: propertyKey,
        parameterIndex: parameterIndex,
      });
      Reflect.defineMetadata(KEY_METADATA, args, target);
    };
  } else {
    const providers = Reflect.getMetadata(
      "design:paramtypes",
      target
    ) as ObjectConstructor[];
    Reflect.defineMetadata(CLASS_METADATA, providers, target);
  }
}

export function CreateInject<T = any>(
  handler: (ctx: HttpContext) => T | Promise<T>,
  type?: InjectType
): PropertyDecorator & ParameterDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex?: number
  ) {
    const args =
      (Reflect.getMetadata(CUSTOM_METADATA, target) as CustomInjectItem[]) ??
      [];
    args.push({
      property: propertyKey,
      parameterIndex: parameterIndex,
      handler: handler,
      type: type,
    });
    Reflect.defineMetadata(CUSTOM_METADATA, args, target);
  };
}
