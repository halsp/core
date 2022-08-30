import "reflect-metadata";
import { HttpContext, isUndefined } from "@ipare/core";
import {
  ENABLE_METADATA,
  METADATA,
  OPTIONS_METADATA,
  SCHAME_METADATA,
} from "./constant";
import { createLib, ValidatorLib } from "./validator-lib";
import { RuleRecord } from "./create-decorator";
import { isNumber, ValidatorOptions } from "class-validator";

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

export const V = (): PropertyDecorator &
  ParameterDecorator &
  ClassDecorator &
  ValidatorLib => {
  const decorator = () => undefined;
  Object.assign(decorator, createLib());
  return decorator as any;
};

export function getRules(
  target: any,
  propertyOrIndex?: string | symbol | number
) {
  target = target?.prototype ?? target;
  if (!target) return [];

  let rules: RuleRecord[] = Reflect.getMetadata(METADATA, target) ?? [];
  rules = rules.filter((rule) => {
    if (isUndefined(propertyOrIndex)) return true;
    if (isNumber(propertyOrIndex)) return rule.paramIndex == propertyOrIndex;
    else return rule.propertyKey == propertyOrIndex;
  });
  return rules;
}
