import "@ipare/core";
import { Startup } from "@ipare/core";
import { FileMiddleware, DirectoryMiddleware } from "./middlewares";
import { FileOptions, DirectoryOptions } from "./options";

export { FileOptions, DirectoryOptions };
export { cliConfigHook } from "./cli-config";

declare module "@ipare/core" {
  interface Startup {
    useStatic(): this;
    useStatic(options: DirectoryOptions): this;
    useStatic(options: FileOptions): this;
  }
}

Startup.prototype.useStatic = function (
  options: FileOptions | DirectoryOptions = {
    dir: "static",
  }
): Startup {
  if (options.hasOwnProperty("file")) {
    this.add(() => new FileMiddleware(options as FileOptions));
  } else {
    this.add(() => new DirectoryMiddleware(options as DirectoryOptions));
  }
  return this;
};
