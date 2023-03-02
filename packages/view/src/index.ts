import "@halsp/common";
import { Startup } from "@halsp/common";
import { ViewOptions } from "./view-options";
import { useView } from "./user-view";

declare module "@halsp/common" {
  interface Startup {
    useView(options?: ViewOptions): this;
  }

  interface Context {
    state: Record<string, unknown>;
    view(
      tmpPath: string,
      locals?: Record<string, unknown>
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
export { cliConfigHook } from "./cli-config";
