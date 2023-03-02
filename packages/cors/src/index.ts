import { HttpStartup } from "@halsp/http";
import { CorsMiddleware } from "./cors.middleware";
import { Options } from "./options";

declare module "@halsp/http" {
  interface HttpStartup {
    useCors(options?: Options): this;
  }
}

HttpStartup.prototype.useCors = function (options: Options = {}): HttpStartup {
  return this.add(() => new CorsMiddleware(options));
};
