import { isUndefined, ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord } from "@sfajs/pipe";
import { CALLBACK_DECORATORS } from "../../constant";
import { PipeCallback } from "../../decorators/callback.decorator";

export function getPipeRecordModelType(
  cls: ObjectConstructor,
  record: PipeReqRecord
): ObjectConstructor | undefined {
  let result: ObjectConstructor;
  if (!isUndefined(record.parameterIndex)) {
    const paramTypes = Reflect.getMetadata("design:paramtypes", cls) ?? [];
    result = paramTypes[record.parameterIndex];
  } else {
    result = Reflect.getMetadata(
      "design:type",
      cls.prototype,
      record.propertyKey
    );
  }
  return result;
}

export function getCallbacks(modelCls: ObjectConstructor): PipeCallback[] {
  return (
    Reflect.getMetadata(CALLBACK_DECORATORS, modelCls.prototype ?? modelCls) ??
    []
  );
}
