import { Inject, createInject } from "@halsp/inject";
import { OPTIONS_IDENTITY } from "./constant";
import mongoose from "mongoose";

export function Mongoose(
  identity?: string
): PropertyDecorator & ParameterDecorator;
export function Mongoose(target: any, propertyKey: string | symbol): void;
export function Mongoose(
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
): void;
export function Mongoose(...args: any[]) {
  if (args.length == 0 || (args.length == 1 && typeof args[0] == "string")) {
    return Inject(OPTIONS_IDENTITY + (args[0] ?? ""));
  } else {
    createInject(
      (ctx) => ctx.getService(OPTIONS_IDENTITY),
      args[0],
      args[1],
      args[2]
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Mongoose extends mongoose.Connection {}
