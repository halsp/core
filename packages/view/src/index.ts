import "@halsp/common";
import { Startup, Request } from "@halsp/common";
import { ViewOptions } from "./view-options";
import { useView } from "./user-view";
import * as honion from "honion";

declare module "@halsp/common" {
  interface Startup<
    TReq extends Request = Request,
    TRes extends Response = Response,
    TC extends Context<TReq, TRes> = Context<TReq, TRes>
  > extends honion.Honion<TC> {
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
    view(
      tmpPath: string,
      locals?: Record<string, unknown>
    ): Promise<string | undefined>;
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
