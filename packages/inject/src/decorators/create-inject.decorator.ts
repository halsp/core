import { HttpContext } from "@sfajs/core";
import { CUSTOM_METADATA } from "../constant";
import { InjectCustom } from "../interfaces";
import { InjectType } from "../inject-type";

export function CustomInject<T = any>(
  handler: () => T | Promise<T>,
  type: InjectType.Singleton
): PropertyDecorator & ParameterDecorator;
export function CustomInject<T = any>(
  handler: (ctx: HttpContext) => T | Promise<T>,
  type?: InjectType.Scoped | InjectType.Transient
): PropertyDecorator & ParameterDecorator;
export function CustomInject<T = any>(
  handler: (ctx: any) => T | Promise<T>,
  type?: InjectType
): PropertyDecorator & ParameterDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex?: number
  ) {
    createInject(handler, type, target, propertyKey, parameterIndex);
  };
}

export function createInject<T = any>(
  handler: (ctx: any) => T | Promise<T>,
  type: InjectType | undefined,
  target: any,
  propertyKey: string | symbol,
  parameterIndex?: number
) {
  const args =
    (Reflect.getMetadata(CUSTOM_METADATA, target) as InjectCustom[]) ?? [];
  args.push({
    property: propertyKey,
    parameterIndex: parameterIndex,
    handler: handler,
    type: type,
  });
  Reflect.defineMetadata(CUSTOM_METADATA, args, target);
}
