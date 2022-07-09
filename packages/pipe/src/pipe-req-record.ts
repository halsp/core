import { PipeItem } from "./pipes";
import { PipeReqType } from "./pipe-req-type";
import { PIPE_RECORDS_METADATA } from "./constant";

export interface PipeReqRecord {
  pipes: PipeItem[];
  type: PipeReqType;
  propertyKey: string | symbol;
  property?: string;
  parameterIndex?: number;
}

export function getPipeRecords(cls: any) {
  const result: PipeReqRecord[] = [];
  if (cls.prototype) {
    result.push(
      ...(Reflect.getMetadata(PIPE_RECORDS_METADATA, cls.prototype) ?? [])
    );
  }
  result.push(...(Reflect.getMetadata(PIPE_RECORDS_METADATA, cls) ?? []));
  return result;
}
