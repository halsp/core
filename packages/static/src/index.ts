import "@sfajs/core";
import { Startup } from "@sfajs/core";
import SingleStaticMiddleware from "./SingleStaticMiddleware";
import { SingleStaticConfig, StaticConfig } from "./StaticConfig";
import StaticMiddleware from "./StaticMiddleware";

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

  if (Object.keys(cfg).includes("file")) {
    this.add(() => new SingleStaticMiddleware(cfg as SingleStaticConfig));
  } else {
    this.add(() => new StaticMiddleware(cfg as StaticConfig));
  }
  return this as T;
};
