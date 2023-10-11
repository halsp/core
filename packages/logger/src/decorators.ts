import { Inject, createInject } from "@halsp/inject";
import { OPTIONS_IDENTITY } from "./constant";
import winston from "winston";

export function Logger(
  identity?: string,
): PropertyDecorator & ParameterDecorator;
export function Logger(target: any, propertyKey: string | symbol): void;
export function Logger(
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number,
): void;
export function Logger(...args: any[]) {
  if (args.length == 0 || (args.length == 1 && typeof args[0] == "string")) {
    return Inject(OPTIONS_IDENTITY + (args[0] ?? ""));
  } else {
    createInject(
      (ctx) => ctx.getService(OPTIONS_IDENTITY),
      args[0],
      args[1],
      args[2],
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Logger extends winston.Logger {}
