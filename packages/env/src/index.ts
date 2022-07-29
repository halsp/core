import { Startup } from "@ipare/core";
import { EnvOptions } from "./options";
import { useSetup } from "./use-setup";

declare module "@ipare/core" {
  interface Startup {
    useConfig(mode: string): this;
    useConfig(options?: EnvOptions): this;
  }
}

Startup.prototype.useConfig = function (
  options?: EnvOptions | string
): Startup {
  return useSetup(this, options);
};

export { EnvOptions, ModeConfigOptions, DotenvConfigOptions } from "./options";
