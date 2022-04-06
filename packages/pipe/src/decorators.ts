import "reflect-metadata";
import { REQ_DECO_METADATA, REQ_PARAMS_METADATA } from "./constant";
import { ReqDecoType, ReqDecoItem } from "./req-deco-item";

const createParamDecorator =
  (type: ReqDecoType, property?: string): PropertyDecorator =>
  (target: any, propertyKey: string | symbol) => {
    const decs =
      (Reflect.getMetadata(REQ_PARAMS_METADATA, target) as ReqDecoItem[]) ?? [];

    decs.push(<ReqDecoItem>{
      propertyKey,
      type,
      property,
    });
    Reflect.defineMetadata(REQ_PARAMS_METADATA, decs, target);
  };

export function Query(property?: string) {
  return createParamDecorator(ReqDecoType.Query, property);
}

export function Body(property?: string) {
  return createParamDecorator(ReqDecoType.Body, property);
}

export function Param(property?: string) {
  return createParamDecorator(ReqDecoType.Param, property);
}

export function Header(property?: string) {
  return createParamDecorator(ReqDecoType.Header, property);
}

export function ReqParse(target: any, propertyKey: string | symbol): void {
  const args =
    (Reflect.getMetadata(REQ_DECO_METADATA, target) as (string | symbol)[]) ??
    [];
  args.push(propertyKey);
  Reflect.defineMetadata(REQ_DECO_METADATA, args, target);
}
