import { PipeItem } from "./pipes";
import { PipeReqType } from "./pipe-req-type";

export interface PipeRecord {
  pipes: PipeItem[];
  type: PipeReqType;
  property: string | symbol;
  parameterIndex?: number;
}
