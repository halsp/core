import { ObjectConstructor } from "@sfajs/core";
import { PROPERTY_METADATA, CLASS_METADATA, KEY_METADATA } from "./constant";
import { InjectKey } from "./inject-key";

export function Inject(
  property: string
): PropertyDecorator & ParameterDecorator;
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
