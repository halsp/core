import { HttpContext } from "@sfajs/core";
import { INJECT_METADATA } from "../constant";
import { InjectDecoratorParser, InjectType } from "./inject-decorator-parser";
import { InjectDecoratorTypes } from "./inject-decorator-types";
import { InjectDecoratorValue } from "./inject-decorator-value";

const createInjectDecorator =
  (type: InjectDecoratorTypes): PropertyDecorator =>
  (target: any, propertyKey: string | symbol) => {
    const args =
      (Reflect.getMetadata(
        INJECT_METADATA,
        target
      ) as InjectDecoratorValue[]) ?? [];
    args.push(<InjectDecoratorValue>{
      propertyKey,
      type,
    });
    Reflect.defineMetadata(INJECT_METADATA, args, target);
  };

export function Inject(type = InjectDecoratorTypes.Transient) {
  return createInjectDecorator(type);
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
export * from "./inject-decorator-types";
export * from "./inject-decorator-value";
