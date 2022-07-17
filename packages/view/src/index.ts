import "@ipare/core";
import { Startup } from "@ipare/core";
import {
  ViewOptions,
  consolidate,
  Engine,
  RendererInterface,
} from "./view-options";
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

Startup.prototype.useView = function <T extends Startup>(
  options: ViewOptions = {}
): T {
  useView(this, options);
  return this as T;
};

export { consolidate, RendererInterface, Engine, ViewOptions };
