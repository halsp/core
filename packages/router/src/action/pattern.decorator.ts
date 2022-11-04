import "reflect-metadata";
import { ACTION_PATTERN_METADATA } from "../constant";
import { Dict } from "@ipare/core";
import { PatternItem } from "./pattern-item";

function createPatternDecorator(
  pattern: string | Dict<any>,
  type: "message" | "event"
): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { composePattern } = require("@ipare/micro");
  return function (target: any) {
    const patterns: PatternItem[] =
      Reflect.getMetadata(ACTION_PATTERN_METADATA, target.prototype) ?? [];
    patterns.push({
      pattern: composePattern(pattern),
      type,
    });
    Reflect.defineMetadata(ACTION_PATTERN_METADATA, patterns, target.prototype);
  };
}

export function MessagePattern(pattern: string | Dict<any>): ClassDecorator {
  return createPatternDecorator(pattern, "message");
}

export function EventPattern(pattern: string | Dict<any>): ClassDecorator {
  return createPatternDecorator(pattern, "event");
}
