import "@halsp/core";
import { Startup } from "@halsp/core";
import { ViewOptions } from "./view-options";
import { useView } from "./user-view";

declare module "@halsp/core" {
  interface Startup {
    useView(options?: ViewOptions): this;
  }

  interface Context {
    state: Record<string, unknown>;
    view(
      tmpPath: string,
      locals?: Record<string, unknown>,
    ): Promise<string | undefined>;
  }

  interface Response {
    view(tmpPath: string, locals?: Record<string, unknown>): Promise<this>;
  }
}

Startup.prototype.useView = function (options: ViewOptions = {}): Startup {
  return useView(this, options);
};

export {
  consolidate,
  Engine,
  RendererInterface,
  ViewOptions,
} from "./view-options";
export { HALSP_CLI_PLUGIN_CONFIG_HOOK } from "./cli-config";
