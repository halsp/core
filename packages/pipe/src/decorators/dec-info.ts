import { PipeItem } from "../pipes";
import { ReqType } from "../req-type";

export interface DecInfo {
  pipes: PipeItem[];
  property: string | symbol;
  type: ReqType;
  parameterIndex?: number;
}
