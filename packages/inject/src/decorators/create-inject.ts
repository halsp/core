import { CUSTOM_METADATA } from "../constant";
import { InjectType } from "../inject-type";
import { InjectCustom } from "../interfaces";

export function createInject<T = any>(
  handler: (ctx: any) => T | Promise<T>,
  target: any,
  propertyKey: string | symbol,
  parameterIndex?: number,
  type?: InjectType
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
