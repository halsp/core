import "reflect-metadata";
import { ACTION_PATTERN_METADATA } from "../constant";

export function MicroPattern(pattern: string): ClassDecorator {
  return function (target: any) {
    const patterns: string[] =
      Reflect.getMetadata(ACTION_PATTERN_METADATA, target.prototype) ?? [];
    patterns.push(pattern);
    Reflect.defineMetadata(ACTION_PATTERN_METADATA, patterns, target.prototype);
  };
}
