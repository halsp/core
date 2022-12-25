import { HttpStartup } from "@ipare/http";
import { DirectoryMiddleware } from "./middlewares/directory.middleware";
import { FileMiddleware } from "./middlewares/file.middleware";
import { MatchMiddleware } from "./middlewares/match.middleware";
import { MethodMiddleware } from "./middlewares/method.middleware";
import { Status404Middleware } from "./middlewares/status404.middleware";
import { Status405Middleware } from "./middlewares/status405.middleware";
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
  this.add(() => new MethodMiddleware(options));
  this.add(() => new MatchMiddleware(options));
  if (options.file405) {
    this.add(() => new Status405Middleware(options));
  }
  if (options.hasOwnProperty("file")) {
    this.add(() => new FileMiddleware(options as FileOptions));
  } else {
    this.add(() => new DirectoryMiddleware(options as DirectoryOptions));
  }
  if (options.file404) {
    this.add(() => new Status404Middleware(options));
  }
  return this;
};
