import { PipeItem } from "../pipe-item";
import { GlobalPipeType } from "./global-pipe-type";

export type GlobalPipeItem<T = any, R = any> = {
  pipe: PipeItem<T, R>;
  type: GlobalPipeType;
};
