export {
  Dict,
  ReadonlyDict,
  ObjectConstructor,
  isUndefined,
  isNull,
  isNil,
  isArrayEmpty,
  isFunction,
  isNilOrBlank,
  isNumber,
  isFiniteNumber,
  isObject,
  isPlainObject,
  isString,
  isSymbol,
  isClass,
  normalizePath,
  addLeadingSlash,
  isCliAssetExist,
  getCliAssets,
  tryAddCliAssets,
  closeServer,
  logAddress,
  getHalspPort,
} from "./utils";

export { Context, Request, Response } from "./context";
export { Startup } from "./startup";
export { Middleware, ComposeMiddleware, HookType } from "./middlewares";
export {
  HalspException,
  ExceptionMessage,
  isExceptionMessage,
} from "./exception";
export { ILogger } from "./logger";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    export interface ProcessEnv {
      NODE_ENV: string;
      HALSP_ENV: "http" | "micro";
    }
  }
}
