import { HttpStartup } from "@ipare/http";
import { CorsMiddleware } from "./cors.middleware";
import { Options } from "./options";

declare module "@ipare/http" {
  interface HttpStartup {
    useCors(options?: Options): this;
  }
}

HttpStartup.prototype.useCors = function (options: Options = {}): HttpStartup {
  return this.add(() => new CorsMiddleware(options));
};
