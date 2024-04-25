import "reflect-metadata";
import {
  createInject,
  getClassProptotype,
  getClassConstractor,
} from "@halsp/inject";
import { Dict, Context, isClass, isUndefined, isObject } from "@halsp/core";
import { addPipeRecord, getPipeRecords } from "../pipe-req-record";
import { PipeReqType } from "../pipe-req-type";
import { execPipes } from "./exec-pipes";

function getPropertyType(
  target: any,
  propertyKey: string | symbol,
  parameterIndex?: number,
): any {
  if (!isUndefined(parameterIndex)) {
    target = getClassConstractor(target);
    const types = Reflect.getMetadata("design:paramtypes", target) ?? [];
    return types[parameterIndex];
  } else {
    target = getClassProptotype(target);
    return Reflect.getMetadata("design:type", target, propertyKey);
  }
}

async function getObjectFromDict(ctx: Context, cls: any, dict?: Dict) {
  if (dict && isClass(cls)) {
    const obj = new cls();
    const properties = getPipeRecords(cls).filter((r) => r.type == "property");
    for (const key in dict) {
      if (key in obj && !properties.some((p) => p.propertyKey == key)) {
        obj[key] = dict[key];
      } else {
        const keyProperties = properties.filter(
          (p) => (p.property ?? p.propertyKey) == key,
        );
        for (const property of keyProperties) {
          const propertyType = getPropertyType(
            cls.prototype,
            property.propertyKey,
          );
          let val = dict[key];
          val = await execPipes(
            ctx,
            obj,
            cls,
            property.property,
            property.propertyKey,
            property.parameterIndex,
            await getObjectFromDict(ctx, propertyType, val),
            propertyType,
            property.pipes,
          );
          obj[property.propertyKey] = val;
        }
      }
    }
    return obj;
  } else {
    return dict;
  }
}

export function createReqDecorator(type: PipeReqType, args: any[]) {
  const handler = getReqHandler(type);

  if (typeof args[0] == "string") {
    // property params
    const pipes = args.slice(1, args.length);
    return function (
      target: any,
      propertyKey: string | symbol,
      parameterIndex?: number,
    ) {
      addPipeRecord(type, pipes, target, propertyKey, parameterIndex, args[0]);
      const propertyType = getPropertyType(target, propertyKey, parameterIndex);
      createInject(
        async (ctx, parent) => {
          const property = args[0];
          const dict = handler(ctx);
          const val = dict && isObject(dict) ? dict[property] : undefined;
          return await execPipes(
            ctx,
            parent,
            target,
            property,
            propertyKey,
            parameterIndex,
            await getObjectFromDict(ctx, propertyType, val),
            propertyType,
            pipes,
          );
        },
        target,
        propertyKey,
        parameterIndex,
      );
    };
  } else if (typeof args[1] == "string" || typeof args[2] == "number") {
    const target = typeof args[2] == "number" ? args[0].prototype : args[0];
    addPipeRecord(type, [], target, args[1], args[2]);
    const propertyType = getPropertyType(target, args[1], args[2]);
    createInject(
      async (ctx, parent) => {
        const val = await getObjectFromDict(ctx, propertyType, handler(ctx));
        return await execPipes(
          ctx,
          parent,
          target,
          undefined,
          args[1],
          args[2],
          val,
          propertyType,
          [],
        );
      },
      args[0],
      args[1],
      args[2],
    );
  } else {
    const pipes = args;
    return function (
      target: any,
      propertyKey: string | symbol,
      parameterIndex?: number,
    ) {
      addPipeRecord(type, pipes, target, propertyKey, parameterIndex);
      const propertyType = getPropertyType(target, propertyKey, parameterIndex);
      createInject(
        async (ctx, parent) => {
          const val = await getObjectFromDict(ctx, propertyType, handler(ctx));
          return await execPipes(
            ctx,
            parent,
            target,
            undefined,
            propertyKey,
            parameterIndex,
            val,
            propertyType,
            pipes,
          );
        },
        target,
        propertyKey,
        parameterIndex,
      );
    };
  }
}

function getReqHandler(type: PipeReqType): (ctx: Context) => Dict | undefined {
  switch (type) {
    case "header":
      return (ctx) => ctx.req["headers"];
    case "query":
      return (ctx) => ctx.req["query"];
    case "param":
      return (ctx) => ctx.req["params"] ?? ctx.req["param"];
    default:
      return (ctx) => ctx.req.body;
  }
}
