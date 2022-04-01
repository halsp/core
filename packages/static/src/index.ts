import "@sfajs/core";
import { Startup } from "@sfajs/core";
import { SingleStaticMiddleware } from "./single-static.middleware";
import { SingleStaticConfig, StaticConfig } from "./static-config";
import { StaticMiddleware } from "./static.middleware";

export { SingleStaticConfig, StaticConfig };

declare module "@sfajs/core" {
  interface Startup {
    useStatic<T extends this>(cfg?: StaticConfig): T;
    useStatic<T extends this>(cfg?: SingleStaticConfig): T;
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

  if (cfg.hasOwnProperty("file")) {
    this.add(() => new SingleStaticMiddleware(cfg as SingleStaticConfig));
  } else {
    this.add(() => new StaticMiddleware(cfg as StaticConfig));
  }
  return this as T;
};
