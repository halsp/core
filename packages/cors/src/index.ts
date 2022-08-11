import { Startup } from "@ipare/core";
import { CorsMiddleware } from "./cors.middleware";
import { Options } from "./options";

declare module "@ipare/core" {
  interface Startup {
    useCors(options?: Options): this;
  }
}

Startup.prototype.useCors = function (options: Options = {}): Startup {
  return this.add(() => new CorsMiddleware(options));
};
