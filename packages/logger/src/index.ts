import { Startup } from "@ipare/core";
import winston from "winston";
import Transport from "winston-transport";
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

export { winston, Transport };
export { Logger } from "./decorators";
export { Options } from "./options";
