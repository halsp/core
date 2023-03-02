import { Context } from "@halsp/common";
import { RouterOptions } from "@halsp/router";
import { ViewOptions } from "@halsp/view";

export type CodeType =
  | { code: number; path?: string; replace?: number }
  | number;

export interface MvaOptions {
  viewOptions?: ViewOptions;
  routerOptions?: RouterOptions;
  renderMethods?: string | string[];
  randerEnable?: (ctx: Context) => Promise<boolean> | boolean;
}
