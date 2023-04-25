import { Context, ILogger, Startup } from "@halsp/core";
import { InjectType, IService, parseInject } from "@halsp/inject";
import winston from "winston";
import Transport from "winston-transport";
import { FileTransportOptions } from "winston/lib/winston/transports";
import { OPTIONS_IDENTITY } from "./constant";
import { FileOptions, Options } from "./options";

declare module "@halsp/core" {
  interface Startup {
    useLogger(options?: Omit<Options, "injectType">): this;
    useLogger(identity: string, options?: Options): this;
    useConsoleLogger(
      options?: Omit<Omit<Options, "transports">, "injectType">
    ): this;
    useConsoleLogger(
      identity: string,
      options?: Omit<Options, "transports">
    ): this;
    useFileLogger(
      options: Omit<Omit<Options, "transports">, "injectType"> & {
        fileTransportOptions: FileTransportOptions;
      }
    ): this;
    useFileLogger(
      identity: string,
      options: Omit<Options, "transports"> & {
        fileTransportOptions: FileTransportOptions;
      }
    ): this;
  }

  interface Context {
    getLogger(identity?: string): Promise<ILogger>;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ILogger extends winston.Logger {}
}

function createLogger(options?: Options) {
  const logger = winston.createLogger(options) as IService & ILogger;
  logger.dispose = async () => {
    if (!logger.destroyed) {
      logger.destroy();
    }
  };
  return logger;
}

Startup.prototype.useLogger = function (...args: any[]): Startup {
  const { identity, options } = getOptions(args);

  let defaultLogger: ILogger | undefined;
  if (!identity) {
    defaultLogger = createLogger(options);
    this.setLogger(defaultLogger);
  }

  const injectKey = OPTIONS_IDENTITY + (identity ?? "");
  const injectType = !identity ? InjectType.Singleton : options?.injectType;
  return this.useInject().inject(
    injectKey,
    () => {
      return defaultLogger ?? createLogger(options);
    },
    injectType
  );
};

Context.prototype.getLogger = async function (identity?: string) {
  const injectKey = OPTIONS_IDENTITY + (identity ?? "");
  return (await parseInject(this, injectKey)) as ILogger;
};

Startup.prototype.useConsoleLogger = function (...args: any[]): Startup {
  const { identity, options } = getOptions<Options>(args, {});
  options.transports = new winston.transports.Console();
  return useLogger(this, identity, options);
};

Startup.prototype.useFileLogger = function (...args: any[]): Startup {
  const { identity, options } = getOptions<FileOptions>(args, {});
  options.transports = new winston.transports.File(
    options.fileTransportOptions
  );
  return useLogger(this, identity, options);
};

function getOptions<T extends Options = Options>(
  args: any[]
): {
  identity: string;
  options: T | undefined;
};
function getOptions<T extends Options = Options>(
  args: any[],
  def: T
): {
  identity: string;
  options: T;
};
function getOptions<T extends Options = Options>(args: any[], def?: T) {
  const identity = typeof args[0] == "string" ? args[0] : undefined;
  const options = (typeof args[0] == "string" ? args[1] : args[0]) as
    | T
    | undefined;

  return { identity, options: options || def };
}

function useLogger<T extends Options = Options>(
  startup: Startup,
  identity: string,
  options: T
) {
  if (identity) {
    return startup.useLogger(identity, options);
  } else {
    return startup.useLogger(options);
  }
}

export { Transport };
export { Logger } from "./decorators";
export { Options } from "./options";
