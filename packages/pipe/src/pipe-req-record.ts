import { PipeItem, PipeReqType } from "./pipes";
import { PIPE_RECORDS_METADATA } from "./constant";
import { isClass } from "@halsp/core";

export interface PipeReqRecord {
  pipes: PipeItem[];
  type: PipeReqType;
  propertyKey: string | symbol;
  property?: string;
  parameterIndex?: number;
}

function getProptotype(target: any) {
  return isClass(target) ? target.prototype : target;
}

export function getPipeRecords(target: any): ReadonlyArray<PipeReqRecord> {
  target = getProptotype(target);
  return Reflect.getMetadata(PIPE_RECORDS_METADATA, target) ?? [];
}

function setPipeRecords(target: any, records: PipeReqRecord[]) {
  target = getProptotype(target);
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
