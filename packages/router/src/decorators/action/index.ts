import "reflect-metadata";
import { ActionDecoratorTypes } from "./action-decorator-types";
import { ROUTE_ARGS_METADATA } from "../../constant";
import { ActionDecoratorValue } from "./action-decorator-value";

export * from "./action-decorator-parser";
export * from "./action-decorator-types";
export * from "./action-decorator-value";

const createParamDecorator =
  (type: ActionDecoratorTypes, property?: string): PropertyDecorator =>
  (target: any, propertyKey: string | symbol) => {
    const decs =
      (Reflect.getMetadata(
        ROUTE_ARGS_METADATA,
        target
      ) as ActionDecoratorValue[]) ?? [];

    decs.push(<ActionDecoratorValue>{
      propertyKey,
      type,
      property,
    });
    Reflect.defineMetadata(ROUTE_ARGS_METADATA, decs, target);
  };

export function Query(property?: string) {
  return createParamDecorator(ActionDecoratorTypes.Query, property);
}

export function Body(property?: string) {
  return createParamDecorator(ActionDecoratorTypes.Body, property);
}

export function Param(property?: string) {
  return createParamDecorator(ActionDecoratorTypes.Param, property);
}

export function Header(property?: string) {
  return createParamDecorator(ActionDecoratorTypes.Header, property);
}
