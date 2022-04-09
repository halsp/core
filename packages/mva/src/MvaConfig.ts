import { Startup } from "@sfajs/core";
import { RouterConfig } from "@sfajs/router";
import { ViewsConfig } from "@sfajs/views";

export default interface MvaConfig {
  codes?: ({ code: number; path?: string; replace?: number } | number)[];
  viewsConfig?: ViewsConfig;
  routerConfig?: RouterConfig;
  onParserAdded?: <T extends Startup>(startup: T) => T;
}
