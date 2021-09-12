import RouterConfig from "./RouterConfig";
import { ViewsConfig } from "@sfajs/views";

export default interface MvaConfig {
  codes?: ({ code: number; path?: string; replace?: number } | number)[];
  viewsConfig?: ViewsConfig;
  routerConfig?: RouterConfig;
}
