import { HttpContext } from "@ipare/core";
import { RouterOptions } from "@ipare/router";
import { ViewOptions } from "@ipare/view";

export type CodeType =
  | { code: number; path?: string; replace?: number }
  | number;

export interface MvaOptions {
  viewOptions?: ViewOptions;
  routerOptions?: RouterOptions;
  renderMethods?: string | string[];
  randerEnable?: (ctx: HttpContext) => Promise<boolean> | boolean;
}
