import "reflect-metadata";
import { createInject, parseInject } from "@ipare/inject";
import {
  Dict,
  Context,
  isClass,
  isUndefined,
  ObjectConstructor,
} from "@ipare/core";
import { GlobalPipeItem, LambdaPipe, PipeItem } from ".";
import { GLOBAL_PIPE_BAG } from "../constant";
import { GlobalPipeType } from "../global-pipe-type";
import { plainToClass } from "class-transformer";
import { addPipeRecord } from "../pipe-req-record";

export type PipeReqType = "query" | "param" | "header" | "body" | "payload";

async function execPipes<T extends object = any>(
  ctx: Context,
  parent: T,
  target: ObjectConstructor<T>,
  property: string | undefined,
  propertyKey: string | symbol,
  parameterIndex: number | undefined,
  value: any,
  propertyType: any,
  pipes: PipeItem[]
) {
  const globalPipes = ctx.bag<GlobalPipeItem[]>(GLOBAL_PIPE_BAG) ?? [];
  const beforeGlobalPipes = globalPipes
    .filter((p) => p.type == GlobalPipeType.before)
    .map((item) => item.pipe);
  const afterGlobalPipes = globalPipes
    .filter((p) => p.type == GlobalPipeType.after)
    .map((item) => item.pipe);

  for (let pipe of [...beforeGlobalPipes, ...pipes, ...afterGlobalPipes]) {
    if (isClass(pipe)) {
      pipe = await parseInject(ctx, pipe);
    } else if (typeof pipe == "function") {
      pipe = new LambdaPipe(pipe);
    }

    if (pipe.transform) {
      value = await pipe.transform({
        value,
        parent,
        ctx,
        propertyType,
        target,
        propertyKey,
        parameterIndex,
        pipes,
        property,
      });
    }
  }
  return value;
}

function getPropertyType(
  target: any,
  propertyKey: string | symbol,
  parameterIndex?: number
): any {
  if (!isUndefined(parameterIndex)) {
    const types = Reflect.getMetadata("design:paramtypes", target) ?? [];
    return types[parameterIndex];
  } else {
    return Reflect.getMetadata("design:type", target, propertyKey);
  }
}

function getObjectFromDict(cls: any, dict: Dict) {
  if (isClass(cls)) {
    return plainToClass(cls, dict);
  } else {
    return dict;
  }
}

export function createDecorator(type: PipeReqType, args: any[]) {
  const handler = getReqHandler(type);

  if (typeof args[0] == "string") {
    // property params
    const pipes = args.slice(1, args.length);
    return function (
      target: any,
      propertyKey: string | symbol,
      parameterIndex?: number
    ) {
      addPipeRecord(type, pipes, target, propertyKey, parameterIndex, args[0]);
      const propertyType = getPropertyType(target, propertyKey, parameterIndex);
      createInject(
        async (ctx, parent) => {
          const property = args[0];
          const dict = handler(ctx);
          const val = getObjectFromDict(propertyType, dict)
            ? dict[property]
            : undefined;
          return await execPipes(
            ctx,
            parent,
            target,
            property,
            propertyKey,
            parameterIndex,
            val,
            propertyType,
            pipes
          );
        },
        target,
        propertyKey,
        parameterIndex
      );
    };
  } else if (typeof args[1] == "string" || typeof args[2] == "number") {
    const target = typeof args[2] == "number" ? args[0].prototype : args[0];
    addPipeRecord(type, [], target, args[1], args[2]);
    const propertyType = getPropertyType(target, args[1], args[2]);
    createInject(
      async (ctx, parent) =>
        await execPipes(
          ctx,
          parent,
          target,
          undefined,
          args[1],
          args[2],
          getObjectFromDict(propertyType, handler(ctx)),
          propertyType,
          []
        ),
      args[0],
      args[1],
      args[2]
    );
  } else {
    const pipes = args;
    return function (
      target: any,
      propertyKey: string | symbol,
      parameterIndex?: number
    ) {
      addPipeRecord(type, pipes, target, propertyKey, parameterIndex, args[0]);
      const propertyType = getPropertyType(target, propertyKey, parameterIndex);
      createInject(
        async (ctx, parent) =>
          await execPipes(
            ctx,
            parent,
            target,
            undefined,
            propertyKey,
            parameterIndex,
            getObjectFromDict(propertyType, handler(ctx)),
            propertyType,
            pipes
          ),
        target,
        propertyKey,
        parameterIndex
      );
    };
  }
}

export function getReqHandler(type: PipeReqType): (ctx: Context) => Dict {
  switch (type) {
    case "header":
      return (ctx) => (ctx as any).req.headers;
    case "query":
      return (ctx) => (ctx as any).req.query;
    case "param":
      return (ctx) => (ctx as any).req.params ?? (ctx as any).req.param;
    case "payload":
      return (ctx) => (ctx as any).payload;
    default:
      return (ctx) => (ctx as any).req.body;
  }
}
