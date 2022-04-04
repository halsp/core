import { HttpContext } from "@sfajs/core";
import { INJECT_METADATA } from "../constant";
import { InjectDecoratorParser, InjectType } from "./inject-decorator-parser";

export function Inject(target: any, propertyKey: string | symbol) {
  const args =
    (Reflect.getMetadata(INJECT_METADATA, target) as (string | symbol)[]) ?? [];
  args.push(propertyKey);
  Reflect.defineMetadata(INJECT_METADATA, args, target);
}

export function parseInject<T extends object = any>(
  ctx: HttpContext,
  target: InjectType<T>
): T {
  return new InjectDecoratorParser<T>(ctx, target).parse();
}

export * from "./inject-decorator-middleware";
export * from "./inject-decorator-parser";
export * from "./inject-decorator-record-item";
export * from "../inject-types";
