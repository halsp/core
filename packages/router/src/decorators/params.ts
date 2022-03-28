import "reflect-metadata";
import { RouteParamTypes } from "./route-param-types";
import { ROUTE_ARGS_METADATA } from "../constant";
import { ParamsDecoratorValue } from "./params-decorator-value";

const createParamDecorator =
  (type: RouteParamTypes, data?: any): PropertyDecorator =>
  (target: any, propertyKey: string | symbol) => {
    const args =
      (Reflect.getMetadata(
        ROUTE_ARGS_METADATA,
        target
      ) as ParamsDecoratorValue[]) ?? [];
    args.push(<ParamsDecoratorValue>{
      propertyKey,
      type,
      data,
    });
    Reflect.defineMetadata(ROUTE_ARGS_METADATA, args, target);
  };

export function Query(data?: any) {
  return createParamDecorator(RouteParamTypes.QUERY, data);
}

export function Body(data?: any) {
  return createParamDecorator(RouteParamTypes.BODY, data);
}

export function Param(data?: any) {
  return createParamDecorator(RouteParamTypes.PARAM, data);
}

export function Header(data?: any) {
  return createParamDecorator(RouteParamTypes.HEADERS, data);
}
