import { PipeTransform } from "./pipe-transform";
import { ObjectConstructor } from "@sfajs/core";

export type ReqPipe<T = any, R = any> =
  | ((val: T) => R | Promise<R>)
  | PipeTransform<T, R>
  | ObjectConstructor<PipeTransform<T, R>>;
