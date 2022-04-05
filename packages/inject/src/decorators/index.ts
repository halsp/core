import { HttpContext } from "@sfajs/core";
import { METADATA } from "../constant";
import { InjectDecoratorParser, InjectTarget } from "./inject-decorator-parser";

export function Inject(target: any, propertyKey: string | symbol) {
  const args =
    (Reflect.getMetadata(METADATA, target) as (string | symbol)[]) ?? [];
  args.push(propertyKey);
  Reflect.defineMetadata(METADATA, args, target);
}

export function parseInject<T extends object = any>(
  ctx: HttpContext,
  target: InjectTarget<T>
): T {
  return new InjectDecoratorParser<T>(ctx, target).parse();
}

export * from "./inject-decorator-parser";
export * from "./inject-decorator-record-item";
export * from "../inject-types";
