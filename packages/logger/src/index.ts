import { Startup } from "@ipare/core";
import winston from "winston";
import { OPTIONS_IDENTITY } from "./constant";
import { Options } from "./options";

declare module "@ipare/core" {
  interface Startup {
    useLogger(options?: Options): this;
  }
}

Startup.prototype.useLogger = function (options?: Options): Startup {
  return this.useInject().inject(
    OPTIONS_IDENTITY + (options?.identity ?? ""),
    () => winston.createLogger(options),
    options?.injectType
  );
};

export { Logger } from "./decorators";
export { Options } from "./options";
