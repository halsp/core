import { isUndefined, ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord } from "@sfajs/pipe";
import { MODEL_DECORATORS, MODEL_PROPERTY_DECORATORS } from "../../constant";
import { DecoratorFn } from "../../decorators";
import { ModelDecoratorFn } from "../../decorators/model.decorator";

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

export function getModelPropertyDecorators(
  modelCls: ObjectConstructor
): DecoratorFn[] {
  return (
    Reflect.getMetadata(MODEL_PROPERTY_DECORATORS, modelCls.prototype) ?? []
  );
}

export function getModelDecorators(
  modelCls: ObjectConstructor
): ModelDecoratorFn[] {
  return Reflect.getMetadata(MODEL_DECORATORS, modelCls) ?? [];
}
