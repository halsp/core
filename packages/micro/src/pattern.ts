import { Dict } from "@ipare/core";

export function composePattern(pattern: string | Dict<any>): string {
  if (typeof pattern == "string") {
    const parsedPattern = parsePattern(pattern);
    if (typeof parsedPattern == "string") {
      return parsedPattern;
    } else {
      return composePattern(parsedPattern);
    }
  } else if (typeof pattern == "object") {
    const result: Dict<any> = {};
    Object.keys(pattern)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        result[key] = pattern[key];
      });
    return JSON.stringify(result);
  } else {
    throw new Error(`Pattern is string or object: ${pattern}`);
  }
}

export function parsePattern(pattern: string): string | Dict<any> {
  if (pattern.startsWith("{") || pattern.startsWith("[")) {
    try {
      return JSON.parse(pattern);
    } catch {
      return pattern;
    }
  } else {
    return pattern;
  }
}
