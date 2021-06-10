import "sfa";
import { Startup } from "sfa";
import SingleStaticMiddleware from "./SingleStaticMiddleware";
import { SingleStaticConfig, StaticConfig } from "./StaticConfig";
import StaticMiddleware from "./StaticMiddleware";

declare module "sfa" {
  interface Startup {
    useStatic<T extends this>(cfg?: StaticConfig): T;
    useStatic<T extends this>(cfg?: SingleStaticConfig): T;
  }

  interface Request {
    readonly query: Record<string, string>;
  }
}

Startup.prototype.useStatic = function <T extends Startup>(
  cfg?: StaticConfig | SingleStaticConfig
): T {
  if (!cfg) {
    cfg = {
      dir: "static",
    };
  }

  if (Object.keys(cfg).includes("file")) {
    this.use(() => new SingleStaticMiddleware(cfg as SingleStaticConfig));
  } else {
    this.use(() => new StaticMiddleware(cfg as StaticConfig));
  }
  return this as T;
};
