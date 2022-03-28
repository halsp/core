import "reflect-metadata";
import { ParamsTypes } from "./params-types";
import { ROUTE_ARGS_METADATA } from "../../constant";
import { ParamsDecoratorValue } from "./params-decorator-value";

const createParamDecorator =
  (type: ParamsTypes, data?: any): PropertyDecorator =>
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
  return createParamDecorator(ParamsTypes.QUERY, data);
}

export function Body(data?: any) {
  return createParamDecorator(ParamsTypes.BODY, data);
}

export function Param(data?: any) {
  return createParamDecorator(ParamsTypes.PARAM, data);
}

export function Header(data?: any) {
  return createParamDecorator(ParamsTypes.HEADERS, data);
}
