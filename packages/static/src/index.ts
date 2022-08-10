import "@ipare/core";
import { Startup } from "@ipare/core";
import { SingleMiddleware, MultipleMiddleware } from "./middlewares";
import { SingleStaticOptions, StaticOptions } from "./static-options";

export { SingleStaticOptions, StaticOptions };
export { cliConfigHook } from "./cli-config";

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
    this.add(() => new SingleMiddleware(options as SingleStaticOptions));
  } else {
    this.add(() => new MultipleMiddleware(options as StaticOptions));
  }
  return this as T;
};
