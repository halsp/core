import { HttpContext } from "@sfajs/core";
import { RouterOptions } from "@sfajs/router";
import { ViewOptions } from "@sfajs/view";

export type CodeType =
  | { code: number; path?: string; replace?: number }
  | number;

export interface MvaOptions {
  viewOptions?: ViewOptions;
  routerOptions?: RouterOptions;
  methods?: string | string[];
  randerEnable?: (ctx: HttpContext) => Promise<boolean> | boolean;
}
