import { HttpContext, isClass, ObjectConstructor } from "@sfajs/core";
import { PROPERTY_METADATA, CLASS_METADATA, KEY_METADATA } from "../constant";
import { InjectType } from "../inject-type";
import { InjectKey } from "../interfaces";
import { createInject } from "./create-inject";
import "reflect-metadata";

export function Inject<T = any>(
  handler: (obj: any) => T | Promise<T>,
  type: InjectType.Singleton
): PropertyDecorator & ParameterDecorator;
export function Inject<T = any>(
  handler: (ctx: HttpContext, obj: any) => T | Promise<T>,
  type?: InjectType.Scoped | InjectType.Transient
): PropertyDecorator & ParameterDecorator;

export function Inject(key: string): PropertyDecorator & ParameterDecorator;
export function Inject(target: any): void;
export function Inject(target: any, propertyKey: string | symbol): void;

export function Inject(
  ...args: any[]
): void | PropertyDecorator | ParameterDecorator {
  if (typeof args[0] == "string") {
    return injectKey(args[0]);
  } else if (typeof args[0] == "object") {
    injectProperty(args[0], args[1]);
  } else if (typeof args[0] == "function" && isClass(args[0])) {
    injectClass(args[0]);
  } else {
    return injectCustom(args[0], args[1]);
  }
}

function injectProperty(target: any, propertyKey: string | symbol) {
  const args =
    (Reflect.getMetadata(PROPERTY_METADATA, target) as (string | symbol)[]) ??
    [];
  args.push(propertyKey);
  Reflect.defineMetadata(PROPERTY_METADATA, args, target);
}

function injectKey(key: string) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex?: number
  ) {
    const args =
      (Reflect.getMetadata(KEY_METADATA, target) as InjectKey[]) ?? [];
    args.push({
      key: key,
      property: propertyKey,
      parameterIndex: parameterIndex,
    });
    Reflect.defineMetadata(KEY_METADATA, args, target);
  };
}

function injectClass(target: any) {
  const providers = Reflect.getMetadata(
    "design:paramtypes",
    target
  ) as ObjectConstructor[];
  Reflect.defineMetadata(CLASS_METADATA, providers, target);
}

function injectCustom<T>(
  handler: (...args: []) => T | Promise<T>,
  type?: InjectType
) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex?: number
  ) {
    createInject(handler, target, propertyKey, parameterIndex, type);
  };
}
