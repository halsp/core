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
  dynamicListen,
  closeServer,
  logAddress,
  getIparePort,
} from "./utils";

export { Context, Request, Response } from "./context";
export { Startup } from "./startup";
export { Middleware, ComposeMiddleware } from "./middleware";
export {
  IpareException,
  ExceptionMessage,
  isExceptionMessage,
} from "./exception";
export { ILogger, HookType } from "honion";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    export interface ProcessEnv {
      NODE_ENV: string;
      IPARE_ENV: "http" | "micro";
    }
  }
}
