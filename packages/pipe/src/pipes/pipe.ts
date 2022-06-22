import { PipeTransform } from "./pipe-transform";
import { ObjectConstructor } from "@sfajs/core";
import { GlobalPipeType } from "../global-pipe-type";

export type PipeItem<T = any, R = any> =
  | ((val: T) => R | Promise<R>)
  | PipeTransform<T, R>
  | ObjectConstructor<PipeTransform<T, R>>;

export type GlobalPipeItem<T = any, R = any> = {
  pipe: PipeItem<T, R>;
  type: GlobalPipeType;
};
