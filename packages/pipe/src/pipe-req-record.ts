import { PipeItem } from "./pipes";
import { PipeReqType } from "./pipe-req-type";

export interface PipeReqRecord {
  pipes: PipeItem[];
  type: PipeReqType;
  propertyKey: string | symbol;
  property?: string;
  parameterIndex?: number;
}
