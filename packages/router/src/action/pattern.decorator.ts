import "reflect-metadata";
import { ACTION_PATTERN_METADATA } from "../constant";
import { Dict } from "@ipare/core";

export function MicroPattern(pattern: string | Dict<any>): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { composePattern } = require("@ipare/micro");
  return function (target: any) {
    const patterns: string[] =
      Reflect.getMetadata(ACTION_PATTERN_METADATA, target.prototype) ?? [];
    patterns.push(composePattern(pattern));
    Reflect.defineMetadata(ACTION_PATTERN_METADATA, patterns, target.prototype);
  };
}
