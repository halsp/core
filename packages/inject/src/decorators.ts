import { ObjectConstructor } from "@sfajs/core";
import { PROPERTY_METADATA, CLASS_METADATA } from "./constant";

export function Inject(target: any): void;
export function Inject(target: any, propertyKey: string | symbol): void;
export function Inject(target: any, propertyKey?: string | symbol): void {
  if (propertyKey) {
    const args =
      (Reflect.getMetadata(PROPERTY_METADATA, target) as (string | symbol)[]) ??
      [];
    args.push(propertyKey);
    Reflect.defineMetadata(PROPERTY_METADATA, args, target);
  } else {
    const providers = Reflect.getMetadata(
      "design:paramtypes",
      target
    ) as ObjectConstructor[];
    Reflect.defineMetadata(CLASS_METADATA, providers, target);
  }
}
