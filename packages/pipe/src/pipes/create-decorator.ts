import "reflect-metadata";
import { createInject, parseInject } from "@sfajs/inject";
import { Dict, HttpContext, isClass, isUndefined } from "@sfajs/core";
import { GlobalPipeItem, LambdaPipe, PipeItem } from ".";
import { getReqHandler, PipeReqType } from "../pipe-req-type";
import { PipeReqRecord } from "../pipe-req-record";
import { GLOBAL_PIPE_BAG, PIPE_RECORDS_METADATA } from "../constant";
import { GlobalPipeType } from "../global-pipe-type";
import { plainToClass } from "class-transformer";

async function execPipes(
  ctx: HttpContext,
  val: any,
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
      val = await pipe.transform(val, ctx, propertyType);
    }
  }
  return val;
}

function setPipeRecord(
  type: PipeReqType,
  pipes: PipeItem[],
  target: any,
  propertyKey: string | symbol,
  parameterIndex?: number,
  property?: string
) {
  const records: PipeReqRecord[] =
    Reflect.getMetadata(PIPE_RECORDS_METADATA, target) ?? [];
  records.push({
    type: type,
    pipes: pipes,
    propertyKey: propertyKey,
    parameterIndex: parameterIndex,
    property: property,
  });
  Reflect.defineMetadata(PIPE_RECORDS_METADATA, records, target);
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
    const pipes = args.slice(1, args.length);
    return function (
      target: any,
      propertyKey: string | symbol,
      parameterIndex?: number
    ) {
      setPipeRecord(type, pipes, target, propertyKey, parameterIndex, args[0]);
      const propertyType = getPropertyType(target, propertyKey, parameterIndex);
      createInject(
        async (ctx) => {
          const property = args[0];
          const dict = handler(ctx);
          const val = getObjectFromDict(propertyType, dict)
            ? dict[property]
            : undefined;
          return await execPipes(ctx, val, propertyType, pipes);
        },
        target,
        propertyKey,
        parameterIndex
      );
    };
  } else if (typeof args[1] == "string") {
    const pipes = args.slice(3, args.length);
    setPipeRecord(type, pipes, args[0], args[1], args[2]);
    const propertyType = getPropertyType(args[0], args[1], args[2]);
    createInject(
      async (ctx) =>
        await execPipes(
          ctx,
          getObjectFromDict(propertyType, handler(ctx)),
          propertyType,
          pipes
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
      setPipeRecord(type, pipes, target, propertyKey, parameterIndex, args[0]);
      const propertyType = getPropertyType(target, propertyKey, parameterIndex);
      createInject(
        async (ctx) =>
          await execPipes(
            ctx,
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
