import "@ipare/core";
import { Startup } from "@ipare/core";
import { SingleStaticMiddleware } from "./single-static.middleware";
import { SingleStaticOptions, StaticOptions } from "./static-options";
import { StaticMiddleware } from "./static.middleware";

export { SingleStaticOptions, StaticOptions };

declare module "@ipare/core" {
  interface Startup {
    useStatic<T extends this>(options?: StaticOptions): T;
    useStatic<T extends this>(options?: SingleStaticOptions): T;
  }
}

Startup.prototype.useStatic = function <T extends Startup>(
  options?: StaticOptions | SingleStaticOptions
): T {
  if (!options) {
    options = {
      dir: "static",
    };
  }

  if (options.hasOwnProperty("file")) {
    this.add(() => new SingleStaticMiddleware(options as SingleStaticOptions));
  } else {
    this.add(() => new StaticMiddleware(options as StaticOptions));
  }
  return this as T;
};
