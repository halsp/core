import { HttpContext, Startup } from "@ipare/core";
import { IService, parseInject } from "@ipare/inject";
import winston from "winston";
import Transport from "winston-transport";
import { FileTransportOptions } from "winston/lib/winston/transports";
import { OPTIONS_IDENTITY } from "./constant";
import { Options } from "./options";

export type Logger = winston.Logger;

declare module "@ipare/core" {
  interface Startup {
    useLogger(options?: Options): this;
    useConsoleLogger(options?: Omit<Options, "transports">): this;
    useFileLogger(
      options: Omit<Options, "transports"> & {
        fileTransportOptions: FileTransportOptions;
      }
    ): this;
  }

  interface HttpContext {
    getLogger(identity?: string): Promise<Logger>;
  }
}

Startup.prototype.useLogger = function (options?: Options): Startup {
  const injectKey = OPTIONS_IDENTITY + (options?.identity ?? "");
  return this.useInject().inject(
    injectKey,
    () => {
      const logger = winston.createLogger(options) as IService & Logger;

      logger.dispose = async () => {
        if (!logger.destroyed) {
          logger.destroy();
        }
      };

      return logger;
    },
    options?.injectType
  );
};

HttpContext.prototype.getLogger = async function (
  identity?: string
): Promise<Logger> {
  const injectKey = OPTIONS_IDENTITY + (identity ?? "");
  return (await parseInject(this, injectKey)) as Logger;
};

Startup.prototype.useConsoleLogger = function (options: Options = {}): Startup {
  options.transports = new winston.transports.Console();
  return this.useLogger(options);
};

Startup.prototype.useFileLogger = function (
  options: Options & { fileTransportOptions: FileTransportOptions }
): Startup {
  options.transports = new winston.transports.File(
    options.fileTransportOptions
  );
  return this.useLogger(options);
};

export { winston, Transport };
export { LoggerInject } from "./decorators";
export { Options } from "./options";
