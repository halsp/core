import "reflect-metadata";
import { createInject, parseInject } from "@sfajs/inject";
import { HttpContext, isClass } from "@sfajs/core";
import { LambdaPipe, PipeItem } from "../pipes";
import { getDictHandler, ReqType } from "../req-type";
import { DecInfo } from "./dec-info";
import { REQ_PARAMS } from "../constant";

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

function setParamsReflect(
  type: ReqType,
  pipes: PipeItem[],
  target: any,
  propertyKey: string | symbol,
  parameterIndex?: number
) {
  const decInfos: DecInfo[] = Reflect.getMetadata(REQ_PARAMS, target) ?? [];
  decInfos.push({
    type: type,
    pipes: pipes,
    property: propertyKey,
    parameterIndex: parameterIndex,
  });
  Reflect.defineMetadata(REQ_PARAMS, target, decInfos);
}

function createReqInjectDecorator<T = any>(
  type: ReqType,
  pipes: PipeItem[],
  handler: (ctx: any) => T | Promise<T>
) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex?: number
  ) {
    setParamsReflect(type, pipes, target, propertyKey, parameterIndex);
    createInject(handler, target, propertyKey, parameterIndex);
  };
}

function getReqInject(type: ReqType, args: any[]) {
  const handler = getDictHandler(type);

  if (typeof args[0] == "string") {
    const pipes = args.slice(1, args.length);
    return createReqInjectDecorator(type, pipes, async (ctx) => {
      const property = args[0];
      const dict = handler(ctx);
      const val = dict ? dict[property] : undefined;
      return await runPipes(ctx, val, pipes);
    });
  } else if (typeof args[1] == "string") {
    const pipes = args.slice(3, args.length);
    setParamsReflect(type, pipes, args[0], args[1], args[2]);
    return createInject(
      async (ctx) => await runPipes(ctx, handler(ctx), pipes),
      args[0],
      args[1],
      args[2]
    );
  } else {
    const pipes = args;
    return createReqInjectDecorator(
      type,
      pipes,
      async (ctx) => await runPipes(ctx, handler(ctx), pipes)
    );
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
  return getReqInject("query", args);
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
  return getReqInject("body", args);
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
  return getReqInject("param", args);
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
  return getReqInject("header", args);
}
