export interface ILogger {
  debug(message: any, ...optionalParams: any[]): this;
  info(message: any, ...optionalParams: any[]): this;
  warn(message: any, ...optionalParams: any[]): this;
  error(message: any, ...optionalParams: any[]): this;
}

export class BaseLogger implements ILogger {
  debug(message: any, ...optionalParams: any[]): this {
    console.debug(message, ...optionalParams);
    return this;
  }
  info(message: any, ...optionalParams: any[]): this {
    console.info(message, ...optionalParams);
    return this;
  }
  warn(message: any, ...optionalParams: any[]): this {
    console.warn(message, ...optionalParams);
    return this;
  }
  error(message: any, ...optionalParams: any[]): this {
    console.error(message, ...optionalParams);
    return this;
  }
}
