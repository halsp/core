import { PipeItem } from "./pipes";
import { PipeType } from "./pipe-type";

export interface PipeRecord {
  pipes: PipeItem[];
  type: PipeType;
  property: string | symbol;
  parameterIndex?: number;
}
