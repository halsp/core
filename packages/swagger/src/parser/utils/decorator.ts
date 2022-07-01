import { isUndefined, ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord } from "@sfajs/pipe";
import { MODEL_DECORATORS } from "../../constant";
import { DecoratorFn } from "../../decorators";

export function getPipeRecordModelType(
  cls: ObjectConstructor,
  record: PipeReqRecord
) {
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

export function getModelDecorators(modelCls: ObjectConstructor): DecoratorFn[] {
  return (
    Reflect.getMetadata(MODEL_DECORATORS, modelCls.prototype ?? modelCls) ?? []
  );
}
