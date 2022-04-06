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

function create(type: ReqDecoType, ...args: any[]): PropertyDecorator | void {
  if (args[1]) {
    createParamDecorator(type)(args[0], args[1]);
  } else {
    return createParamDecorator(type, args[0]);
  }
}

export function Query(target: any, propertyKey: string | symbol): void;
export function Query(property: string): PropertyDecorator;
export function Query(arg1: any, arg2?: any): PropertyDecorator | void {
  return create(ReqDecoType.Query, arg1, arg2);
}

export function Body(target: any, propertyKey: string | symbol): void;
export function Body(property: string): PropertyDecorator;
export function Body(arg1: any, arg2?: any): PropertyDecorator | void {
  return create(ReqDecoType.Body, arg1, arg2);
}

export function Param(target: any, propertyKey: string | symbol): void;
export function Param(property: string): PropertyDecorator;
export function Param(arg1: any, arg2?: any): PropertyDecorator | void {
  return create(ReqDecoType.Param, arg1, arg2);
}

export function Header(target: any, propertyKey: string | symbol): void;
export function Header(property: string): PropertyDecorator;
export function Header(arg1: any, arg2?: any): PropertyDecorator | void {
  return create(ReqDecoType.Header, arg1, arg2);
}

export function ReqParse(target: any, propertyKey: string | symbol): void {
  const args =
    (Reflect.getMetadata(REQ_DECO_METADATA, target) as (string | symbol)[]) ??
    [];
  args.push(propertyKey);
  Reflect.defineMetadata(REQ_DECO_METADATA, args, target);
}
