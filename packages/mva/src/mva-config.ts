import { RouterConfig } from "@sfajs/router";
import { ViewsConfig } from "@sfajs/views";

export type CodeType =
  | { code: number; path?: string; replace?: number }
  | number;

export default interface MvaConfig {
  viewsConfig?: ViewsConfig;
  routerConfig?: RouterConfig;
}
