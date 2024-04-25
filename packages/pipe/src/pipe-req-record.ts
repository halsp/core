import { PipeItem } from "./pipe-item";
import { PipeReqType } from "./pipe-req-type";
import { PIPE_RECORDS_METADATA } from "./constant";
import { getClassProptotype } from "@halsp/inject";

export interface PipeReqRecord {
  pipes: PipeItem[];
  type: PipeReqType;
  propertyKey: string | symbol;
  property?: string;
  parameterIndex?: number;
}

export function getPipeRecords(target: any): ReadonlyArray<PipeReqRecord> {
  target = getClassProptotype(target);
  return Reflect.getMetadata(PIPE_RECORDS_METADATA, target) ?? [];
}

function setPipeRecords(target: any, records: PipeReqRecord[]) {
  target = getClassProptotype(target);
  Reflect.defineMetadata(PIPE_RECORDS_METADATA, records, target);
}

export function addPipeRecord(
  type: PipeReqType,
  pipes: PipeItem[],
  target: any,
  propertyKey: string | symbol,
  parameterIndex?: number,
  property?: string,
) {
  const records = getPipeRecords(target);
  setPipeRecords(target, [
    ...records,
    {
      type: type,
      pipes: pipes,
      propertyKey: propertyKey,
      parameterIndex: parameterIndex,
      property: property,
    },
  ]);
}
