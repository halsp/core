import { Startup } from "@halsp/core";
import "@halsp/http";
import { MatchMiddleware } from "./middlewares/match.middleware";
import { MethodMiddleware } from "./middlewares/method.middleware";
import { ResultMiddleware } from "./middlewares/result.middleware";
import { Status404Middleware } from "./middlewares/status404.middleware";
import { Status405Middleware } from "./middlewares/status405.middleware";
import { FileOptions, DirectoryOptions } from "./options";

export { FileOptions, DirectoryOptions };
export { HALSP_CLI_PLUGIN_CONFIG_HOOK } from "./cli.config";
export { HALSP_CLI_PLUGIN_ATTACH } from "./cli.attach.serve";

declare module "@halsp/core" {
  interface Startup {
    useStatic(): this;
    useStatic(options: DirectoryOptions): this;
    useStatic(options: FileOptions): this;
  }
}

Startup.prototype.useStatic = function (
  options: FileOptions | DirectoryOptions = {
    dir: "static",
  },
): Startup {
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
