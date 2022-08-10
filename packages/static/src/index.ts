import "@ipare/core";
import { Startup } from "@ipare/core";
import { FileMiddleware, DirectoryMiddleware } from "./middlewares";
import { FileOptions, DirectoryOptions } from "./options";

export { FileOptions, DirectoryOptions };
export { cliConfigHook } from "./cli-config";

declare module "@ipare/core" {
  interface Startup {
    useStatic<T extends this>(options?: FileOptions): T;
    useStatic<T extends this>(options?: DirectoryOptions): T;
  }
}

Startup.prototype.useStatic = function <T extends Startup>(
  options?: FileOptions | DirectoryOptions
): T {
  if (!options) {
    options = {
      dir: "static",
    };
  }

  if (options.hasOwnProperty("file")) {
    this.add(() => new FileMiddleware(options as FileOptions));
  } else {
    this.add(() => new DirectoryMiddleware(options as DirectoryOptions));
  }
  return this as T;
};
