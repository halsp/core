import { isUndefined } from "@sfajs/core";
import { PipeReqRecord, PipeReqType } from "@sfajs/pipe";
import {
  OpenApiBuilder,
  OperationObject,
  ParameterObject,
  SchemaObject,
} from "openapi3-ts";
import { createCallbackDecorator } from "./callback.decorator";
import {
  dynamicSetValue,
  getParameterObject,
} from "./dynamic-set-value.decorator";

export type CreatePropertyCallback = (args: {
  builder: OpenApiBuilder;
  pipeRecord: PipeReqRecord;
  schema?: SchemaObject;
  parameter?: ParameterObject;
  target: any;
  propertyKey?: string;
  parameterIndex?: number;
}) => void;

export type PropertySetValueCallback = (args: {
  pipeRecord: PipeReqRecord;
  schema: SchemaObject | ParameterObject;
  builder: OpenApiBuilder;
}) => void;

export type DecoratorFn = (args: {
  pipeType: PipeReqType;
  schema: SchemaObject | OperationObject;
  builder: OpenApiBuilder;
}) => void;

export function createPropertyCallbackDecorator(cb: CreatePropertyCallback) {
  return createCallbackDecorator((args) => {
    cb({
      target: args.target,
      propertyKey: args.propertyKey,
      parameterIndex: args.parameterIndex,
      builder: args.builder,
      pipeRecord: args.pipeRecord,
      schema: args.schema,
      parameter: args.operation
        ? getParameterObject(
            args.pipeRecord.property ?? (args.propertyKey as string),
            args.pipeRecord,
            args.operation
          )
        : undefined,
    });
  });
}

export function createPropertySetValueCallbackDecorator(
  cb: PropertySetValueCallback
) {
  return createPropertyCallbackDecorator((args: any) => {
    dynamicSetValue({
      cb,
      target: args.target,
      propertyKey: args.propertyKey,
      pipeRecord: args.pipeRecord,
      builder: args.builder,
      schema: args.schema,
      parameter: args.parameter,
    });
  });
}

export function isSchema(schema: SchemaObject | ParameterObject) {
  return isUndefined(schema.in);
}
