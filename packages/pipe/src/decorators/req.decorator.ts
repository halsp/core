import "reflect-metadata";
import { createInject, Inject, parseInject } from "@sfajs/inject";
import { Dict, HttpContext, isClass } from "@sfajs/core";
import { LambdaPipe, PipeItem } from "../pipes";

async function runPipes(ctx: HttpContext, val: any, pipes: PipeItem[]) {
  for (let pipe of pipes) {
    if (isClass(pipe)) {
      pipe = await parseInject(ctx, pipe);
    } else if (typeof pipe == "function") {
      pipe = new LambdaPipe(pipe);
    }

    if (pipe.transform) {
      val = await pipe.transform(val);
    }
  }
  return val;
}

function getReqInject(handler: (ctx: HttpContext) => Dict, args: any[]) {
  if (typeof args[0] == "string") {
    const pipes = args.slice(1, args.length);
    return Inject(async (ctx) => {
      const property = args[0];
      const dict = handler(ctx);
      const val = dict ? dict[property] : undefined;
      return await runPipes(ctx, val, pipes);
    });
  } else if (typeof args[1] == "string") {
    const pipes = args.slice(3, args.length);
    return createInject(
      async (ctx) => await runPipes(ctx, handler(ctx), pipes),
      args[0],
      args[1],
      args[2]
    );
  } else {
    const pipes = args;
    return Inject(async (ctx) => await runPipes(ctx, handler(ctx), pipes));
  }
}

export function Query(
  property: string,
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Query(
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Query(target: any, propertyKey: string | symbol): void;
export function Query(
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
): void;
export function Query(...args: any[]): any {
  return getReqInject((ctx) => ctx.req.query, args);
}

export function Body(
  property: string,
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Body(
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Body(target: any, propertyKey: string | symbol): void;
export function Body(
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
): void;
export function Body(...args: any[]): any {
  return getReqInject((ctx) => ctx.req.body, args);
}

export function Param(
  property: string,
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Param(
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
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
  property: string,
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Header(
  ...pipes: PipeItem[]
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
