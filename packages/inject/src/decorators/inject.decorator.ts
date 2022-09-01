import { HttpContext, isClass } from "@ipare/core";
import { PROPERTY_METADATA, KEY_METADATA } from "../constant";
import { InjectType } from "../inject-type";
import { InjectKey } from "../interfaces";
import { createInject } from "./create-inject";
import "reflect-metadata";

export function Inject<T = any>(
  handler: (parent: any) => T | Promise<T>,
  type: InjectType.Singleton
): PropertyDecorator & ParameterDecorator;
export function Inject<T = any>(
  handler: (ctx: HttpContext, parent: any) => T | Promise<T>,
  type?: InjectType.Scoped | InjectType.Transient
): PropertyDecorator & ParameterDecorator;

export function Inject(key: string): PropertyDecorator & ParameterDecorator;
export function Inject(target: any): void;
export function Inject(target: any, propertyKey: string | symbol): void;
export function Inject(
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
): void;

export function Inject(
  ...args: any[]
): void | PropertyDecorator | ParameterDecorator {
  if (typeof args[0] == "string") {
    return injectKey(args[0]);
  } else if (typeof args[2] == "number") {
    // just placehold
    return;
  } else if (typeof args[0] == "object") {
    injectProperty(args[0], args[1]);
  } else if (isClass(args[0])) {
    // just placehold
    return;
  } else {
    return injectCustom(args[0], args[1]);
  }
}

function injectProperty(target: any, propertyKey: string | symbol) {
  target = getProptotype(target);
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
    target = getProptotype(target);
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

export function getProptotype(target: any) {
  return isClass(target) ? target.prototype : target;
}
