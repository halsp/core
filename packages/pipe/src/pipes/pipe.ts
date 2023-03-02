import { PipeTransform, TransformArgs } from "./pipe-transform";
import { ObjectConstructor } from "@halsp/common";
import { GlobalPipeType } from "../global-pipe-type";

export type PipeItem<T = any, R = any> =
  | ((args: TransformArgs<T>) => R | Promise<R>)
  | PipeTransform<T, R>
  | ObjectConstructor<PipeTransform<T, R>>;

export type GlobalPipeItem<T = any, R = any> = {
  pipe: PipeItem<T, R>;
  type: GlobalPipeType;
};
