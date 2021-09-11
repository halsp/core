import { Engine } from "@sfajs/views";
import RouterConfig from "./RouterConfig";

export default interface MvaConfig {
  codes?: ({ code: number; path?: string; replace?: number } | number)[];
  viewsDir?: string;
  viewsOptions?: Record<string, unknown>;
  viewsEngines?: Engine[];
  routerConfig?: RouterConfig;
}
