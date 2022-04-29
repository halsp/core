import { PipeTransform } from "./pipe-transform";
import { ObjectConstructor } from "@sfajs/core";

export type PipeItem<T = any, R = any> =
  | ((val: T) => R | Promise<R>)
  | PipeTransform<T, R>
  | ObjectConstructor<PipeTransform<T, R>>;
