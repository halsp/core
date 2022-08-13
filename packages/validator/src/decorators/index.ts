import { HttpContext } from "@ipare/core";
import { ValidatorOptions } from "class-validator";
import "reflect-metadata";
import {
  SCHAME_METADATA,
  ENABLE_METADATA,
  OPTIONS_METADATA,
} from "../constant";

export function UseValidatorOptions(
  options: (args: {
    ctx: HttpContext;
    val: any;
  }) => ValidatorOptions | Promise<ValidatorOptions>
): ClassDecorator;
export function UseValidatorOptions(options: ValidatorOptions): ClassDecorator;
export function UseValidatorOptions(options: any): ClassDecorator {
  return function (target: any) {
    Reflect.defineMetadata(OPTIONS_METADATA, options, target.prototype);
  };
}

export function UseValidatorSchema(
  schemaName: (args: { ctx: HttpContext; val: any }) => string | Promise<string>
): ClassDecorator;
export function UseValidatorSchema(schemaName: string): ClassDecorator;
export function UseValidatorSchema(schemaName: any): ClassDecorator {
  return function (target: any) {
    Reflect.defineMetadata(SCHAME_METADATA, schemaName, target.prototype);
  };
}

export function ValidatorEnable(
  fn: (args: { ctx: HttpContext; val: any }) => boolean | Promise<boolean>
): ClassDecorator {
  return function (target: any) {
    Reflect.defineMetadata(ENABLE_METADATA, fn, target.prototype);
  };
}
