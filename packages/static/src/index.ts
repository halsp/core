import { HttpStartup } from "@halsp/http";
import { MatchMiddleware } from "./middlewares/match.middleware";
import { MethodMiddleware } from "./middlewares/method.middleware";
import { ResultMiddleware } from "./middlewares/result.middleware";
import { Status404Middleware } from "./middlewares/status404.middleware";
import { Status405Middleware } from "./middlewares/status405.middleware";
import { FileOptions, DirectoryOptions } from "./options";

export { FileOptions, DirectoryOptions };
export { cliConfigHook } from "./cli-config";

declare module "@halsp/http" {
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
  if (options.use405) {
    this.add(() => new Status405Middleware(options));
  }
  this.add(() => new ResultMiddleware(options));
  if (options.use404) {
    this.add(() => new Status404Middleware(options));
  }
  return this;
};
