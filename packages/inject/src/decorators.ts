import { METADATA } from "./constant";

export function Inject(target: any, propertyKey: string | symbol) {
  const args =
    (Reflect.getMetadata(METADATA, target) as (string | symbol)[]) ?? [];
  args.push(propertyKey);
  Reflect.defineMetadata(METADATA, args, target);
}
