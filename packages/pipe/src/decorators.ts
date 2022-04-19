import "reflect-metadata";
import { createInject, Inject } from "@sfajs/inject";
import { Dict, HttpContext } from "@sfajs/core";

function getReqInject(handler: (ctx: HttpContext) => Dict, args: any[]) {
  if (typeof args[0] == "string") {
    return Inject((ctx) => {
      const property = args[0];
      const dict = handler(ctx);
      if (!dict) {
        return undefined;
      }
      return dict[property];
    });
  } else {
    return createInject((ctx) => handler(ctx), args[0], args[1], args[2]);
  }
}

export function Query(property: string): PropertyDecorator & ParameterDecorator;
export function Query(target: any, propertyKey: string | symbol): void;
export function Query(
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
): void;
export function Query(...args: any[]): any {
  return getReqInject((ctx) => ctx.req.query, args);
}

export function Body(property: string): PropertyDecorator & ParameterDecorator;
export function Body(target: any, propertyKey: string | symbol): void;
export function Body(
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
): void;
export function Body(...args: any[]): any {
  return getReqInject((ctx) => ctx.req.body, args);
}

export function Param(property: string): PropertyDecorator & ParameterDecorator;
export function Param(target: any, propertyKey: string | symbol): void;
export function Param(
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
): void;
export function Param(...args: any[]): any {
  return getReqInject(
    (ctx) => (ctx.req as any).params ?? (ctx.req as any).param,
    args
  );
}

export function Header(
  property: string
): PropertyDecorator & ParameterDecorator;
export function Header(target: any, propertyKey: string | symbol): void;
export function Header(
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
): void;
export function Header(...args: any[]): any {
  return getReqInject((ctx) => ctx.req.headers, args);
}

export const Ctx = Inject((ctx) => ctx);
