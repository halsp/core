import "reflect-metadata";
import { REQ_PARAMS_METADATA } from "./constant";
import { ReqParseType, ReqParseItem } from "./req-parse-item";

const createParamDecorator =
  (type: ReqParseType, property?: string): PropertyDecorator =>
  (target: any, propertyKey: string | symbol) => {
    const decs =
      (Reflect.getMetadata(REQ_PARAMS_METADATA, target) as ReqParseItem[]) ??
      [];

    decs.push(<ReqParseItem>{
      propertyKey,
      type,
      property,
    });
    Reflect.defineMetadata(REQ_PARAMS_METADATA, decs, target);
  };

export function Query(property?: string) {
  return createParamDecorator(ReqParseType.Query, property);
}

export function Body(property?: string) {
  return createParamDecorator(ReqParseType.Body, property);
}

export function Param(property?: string) {
  return createParamDecorator(ReqParseType.Param, property);
}

export function Header(property?: string) {
  return createParamDecorator(ReqParseType.Header, property);
}
