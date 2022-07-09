import { isClass, isUndefined, ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord } from "@sfajs/pipe";
import {
  OpenApiBuilder,
  OperationObject,
  ParameterObject,
  SchemaObject,
} from "openapi3-ts";
import { CALLBACK_DECORATORS } from "../constant";

export type CallbackArgs = {
  builder: OpenApiBuilder;
  pipeRecord: PipeReqRecord;
};

export type PipeSchemaCallbackArgs = CallbackArgs & {
  schema: SchemaObject;
};
export type PipeSchemaCallback = (args: PipeSchemaCallbackArgs) => void;

export type PipeOperationCallbackArgs = CallbackArgs & {
  operation: OperationObject;
};
export type PipeOperationCallback = (args: PipeOperationCallbackArgs) => void;

export type PipeParameterCallbackArgs = {
  parameter: ParameterObject;
} & CallbackArgs;
export type PipeParameterCallback = (args: PipeParameterCallbackArgs) => void;

export type PipeCallback = PipeSchemaCallback | PipeOperationCallback;

export type SetValueCallback = (args: {
  pipeRecord: PipeReqRecord;
  schema: SchemaObject | ParameterObject | OperationObject;
  builder: OpenApiBuilder;
}) => void;

export interface CallbackItem {
  callback: PipeCallback;
  propertyKey?: string;
  parameterIndex?: number;
}

export type CreateCallback = (args: {
  builder: OpenApiBuilder;
  pipeRecord: PipeReqRecord;
  schema?: SchemaObject;
  operation?: OperationObject;
  target: any;
  propertyKey?: string;
  parameterIndex?: number;
}) => void;

export function createCallbackDecorator(
  cb: CreateCallback
): ClassDecorator & PropertyDecorator & ParameterDecorator {
  return function (
    target: any,
    propertyKey?: string | symbol,
    parameterIndex?: number
  ) {
    target = getProtoType(target);
    const callbacks: CallbackItem[] =
      Reflect.getMetadata(CALLBACK_DECORATORS, target) ?? [];
    callbacks.push({
      callback: (args: any) => {
        cb({
          target,
          propertyKey: propertyKey as string,
          parameterIndex,
          builder: args.builder,
          pipeRecord: args.pipeRecord,
          schema: args.schema,
          operation: args.operation,
        });
      },
      propertyKey: propertyKey as string,
      parameterIndex,
    });
    Reflect.defineMetadata(CALLBACK_DECORATORS, callbacks, target);
  };
}

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

export function getCallbacks(target: any): CallbackItem[] {
  return Reflect.getMetadata(CALLBACK_DECORATORS, getProtoType(target)) ?? [];
}

function getProtoType(target: any) {
  return isClass(target) ? target.prototype : target;
}
