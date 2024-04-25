import { PipeTransform, TransformArgs } from "./pipe-transform";
import { ObjectConstructor } from "@halsp/core";

export type PipeItem<T = any, R = any> =
  | ((args: TransformArgs<T>) => R | Promise<R>)
  | PipeTransform<T, R>
  | ObjectConstructor<PipeTransform<T, R>>;
