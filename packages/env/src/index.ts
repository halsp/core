import { Startup } from "@ipare/core";
import { EnvOptions } from "./options";
import { useSetup } from "./use-setup";

declare module "@ipare/core" {
  interface Startup {
    useEnv(mode: string): this;
    useEnv(options?: EnvOptions): this;
  }
}

Startup.prototype.useEnv = function (options?: EnvOptions | string): Startup {
  return useSetup(this, options);
};

export { EnvOptions, ModeConfigOptions, DotenvConfigOptions } from "./options";
