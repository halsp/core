import { HttpStartup } from "@ipare/http";
import { FileMiddleware, DirectoryMiddleware } from "./middlewares";
import { FileOptions, DirectoryOptions } from "./options";

export { FileOptions, DirectoryOptions };
export { cliConfigHook } from "./cli-config";

declare module "@ipare/http" {
  interface HttpStartup {
    useStatic(): this;
    useStatic(options: DirectoryOptions): this;
    useStatic(options: FileOptions): this;
  }
}

HttpStartup.prototype.useStatic = function (
  options: FileOptions | DirectoryOptions = {
    dir: "static",
  }
): HttpStartup {
  if (options.hasOwnProperty("file")) {
    this.add(() => new FileMiddleware(options as FileOptions));
  } else {
    this.add(() => new DirectoryMiddleware(options as DirectoryOptions));
  }
  return this;
};
