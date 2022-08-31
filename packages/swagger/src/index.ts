import "@ipare/core";
import "@ipare/router";
import { Startup } from "@ipare/core";
import { USED } from "./constant";
import { SwaggerOptions } from "./startup/swagger-options";
import { useSetup } from "./startup/use-setup";
import "./validator.decorator";

declare module "@ipare/core" {
  interface Startup {
    useSwagger(options?: SwaggerOptions): this;
  }
  interface HttpContext {
    get swaggerOptions(): SwaggerOptions;
  }
}

Startup.prototype.useSwagger = function (
  options: SwaggerOptions = {}
): Startup {
  if (!!this[USED]) {
    return this;
  }
  this[USED] = true;

  return useSetup(this, options);
};

export { S } from "./validator.decorator";
