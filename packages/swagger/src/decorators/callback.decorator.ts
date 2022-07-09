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

export type CreateCallback = (args: {
  builder: OpenApiBuilder;
  pipeRecord: PipeReqRecord;
  schema?: SchemaObject;
  operation?: OperationObject;
  target: any;
  propertyKey?: string | symbol;
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
    target = target.proptotype ?? target;
    const callbacks: PipeCallback[] =
      Reflect.getMetadata(CALLBACK_DECORATORS, target) ?? [];
    callbacks.push((args: any) => {
      cb({
        target,
        propertyKey,
        parameterIndex,
        builder: args.builder,
        pipeRecord: args.pipeRecord,
        schema: args.schema,
        operation: args.operation,
      });
    });
    Reflect.defineMetadata(CALLBACK_DECORATORS, callbacks, target);
  };
}
