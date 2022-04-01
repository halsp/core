import "reflect-metadata";
import { ActionDecoratorTypes } from "./action-decorator-types";
import { ROUTE_ARGS_METADATA } from "../../constant";
import { ActionDecoratorValue } from "./action-decorator-value";

export * from "./action-decorator-parser";
export * from "./action-decorator-types";
export * from "./action-decorator-value";

const createParamDecorator =
  (type: ActionDecoratorTypes, data?: any): PropertyDecorator =>
  (target: any, propertyKey: string | symbol) => {
    const decs =
      (Reflect.getMetadata(
        ROUTE_ARGS_METADATA,
        target
      ) as ActionDecoratorValue[]) ?? [];

    decs.push(<ActionDecoratorValue>{
      propertyKey,
      type,
      data,
    });
    Reflect.defineMetadata(ROUTE_ARGS_METADATA, decs, target);
  };

export function Query(data?: any) {
  return createParamDecorator(ActionDecoratorTypes.Query, data);
}

export function Body(data?: any) {
  return createParamDecorator(ActionDecoratorTypes.Body, data);
}

export function Param(data?: any) {
  return createParamDecorator(ActionDecoratorTypes.Param, data);
}

export function Header(data?: any) {
  return createParamDecorator(ActionDecoratorTypes.Header, data);
}
