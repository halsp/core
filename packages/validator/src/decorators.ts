import "reflect-metadata";
import { Context, isUndefined } from "@halsp/core";
import { ENABLE_METADATA, METADATA, OPTIONS_METADATA } from "./constant";
import { RuleRecord, createDecorator } from "./create-decorator";
import { isNumber, ValidatorOptions } from "class-validator";
import { ValidatorDecoratorReturnType, createLib } from "./validator-lib";

export function UseValidatorOptions(
  options: (args: {
    ctx: Context;
    val: any;
  }) => ValidatorOptions | Promise<ValidatorOptions>,
): ClassDecorator;
export function UseValidatorOptions(options: ValidatorOptions): ClassDecorator;
export function UseValidatorOptions(options: any): ClassDecorator {
  return function (target: any) {
    Reflect.defineMetadata(OPTIONS_METADATA, options, target.prototype);
  };
}

export function ValidatorEnable(
  fn: (args: { ctx: Context; val: any }) => boolean | Promise<boolean>,
): ClassDecorator {
  return function (target: any) {
    Reflect.defineMetadata(ENABLE_METADATA, fn, target.prototype);
  };
}

export function getRules(
  target: any,
  propertyOrIndex?: string | symbol | number,
) {
  target = target?.prototype ?? target;
  if (!target) return [];

  let rules: RuleRecord[] = Reflect.getMetadata(METADATA, target) ?? [];
  rules = rules.filter((rule) => {
    if (isUndefined(propertyOrIndex)) return true;
    if (isNumber(propertyOrIndex)) {
      return rule.parameterIndex == propertyOrIndex;
    } else {
      return rule.propertyKey == propertyOrIndex;
    }
  });
  return rules;
}

export const V = (() =>
  createDecorator(createLib())) as ValidatorDecoratorReturnType &
  (() => ValidatorDecoratorReturnType);
