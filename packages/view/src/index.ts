import "@ipare/core";
import { Startup } from "@ipare/core";
import { ViewOptions } from "./view-options";
import { useView } from "./user-view";

declare module "@ipare/core" {
  interface Startup {
    useView(options?: ViewOptions): this;
  }

  interface HttpContext {
    state: Record<string, unknown>;
  }

  interface ResultHandler {
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
