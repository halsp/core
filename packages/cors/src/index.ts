import { Startup } from "@halsp/core";
import { CorsMiddleware } from "./cors.middleware";
import { Options } from "./options";

declare module "@halsp/core" {
  interface Startup {
    useCors(options?: Options): this;
  }
}

Startup.prototype.useCors = function (options: Options = {}) {
  return this.add(() => new CorsMiddleware(options));
};
