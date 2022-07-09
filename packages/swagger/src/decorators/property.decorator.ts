import { isClass, isUndefined } from "@sfajs/core";
import { PipeReqRecord, PipeReqType } from "@sfajs/pipe";
import {
  OpenApiBuilder,
  OperationObject,
  ParameterObject,
  SchemaObject,
} from "openapi3-ts";
import { getPipeRecordModelType } from "../parser/utils/decorator";
import { pipeTypeToDocType, typeToApiType } from "../parser/utils/doc-types";
import { ensureModelSchema } from "../parser/utils/model-schema";
import { createCallbackDecorator } from "./callback.decorator";

export type CreatePropertyCallback = (args: {
  builder: OpenApiBuilder;
  pipeRecord: PipeReqRecord;
  schema?: SchemaObject;
  parameter?: ParameterObject;
  target: any;
  propertyKey?: string | symbol;
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

function getParameterObject(
  propertyKey: string | symbol,
  pipeRecord: PipeReqRecord,
  schema: OperationObject
) {
  const parameters = schema.parameters as ParameterObject[];
  const existParameter = parameters.filter((p) => p.name == propertyKey)[0];
  const parameter = existParameter ?? {
    name: propertyKey,
    in: pipeTypeToDocType(pipeRecord.type),
    required: pipeRecord.type == "param",
  };
  if (!existParameter) {
    parameters.push(parameter);
  }
  return parameter;
}

export function createPropertyCallbackDecorator(cb: CreatePropertyCallback) {
  return createCallbackDecorator((args) => {
    if (!args.operation) return;

    cb({
      target: args.target,
      propertyKey: args.propertyKey,
      parameterIndex: args.parameterIndex,
      builder: args.builder,
      pipeRecord: args.pipeRecord,
      schema: args.schema,
      parameter: getParameterObject(
        args.pipeRecord.property ?? (args.propertyKey as string),
        args.pipeRecord,
        args.operation
      ),
    });
  });
}

export function createPropertySetValueCallbackDecorator(
  cb: PropertySetValueCallback
) {
  return createPropertyCallbackDecorator((args: any) => {
    setPropertyValue(
      cb,
      args.target,
      args.propertyKey,
      args.pipeRecord,
      args.builder,
      args.schema,
      args.operation
    );
  });
}

export function setPropertyValue(
  cb: PropertySetValueCallback,
  target: any,
  propertyKey: string,
  pipeRecord: PipeReqRecord,
  builder: OpenApiBuilder,
  schema?: SchemaObject,
  operation?: OperationObject | ParameterObject
) {
  const property = pipeRecord.property ?? propertyKey;
  let dict: SchemaObject | ParameterObject = {};
  if (!isUndefined(schema)) {
    if (!schema.properties) {
      schema.properties = {};
    }
    if (!schema.properties[property]) {
      const propertyCls = getPipeRecordModelType(target, pipeRecord);
      if (isClass(propertyCls)) {
        ensureModelSchema(builder, propertyCls, pipeRecord);
        schema.properties[property] = {
          $ref: `#/components/schemas/${propertyCls.name}`,
        };
      } else {
        schema.properties[property] = {
          type: typeToApiType(propertyCls),
          nullable: true,
        };
      }
    }
    dict = schema.properties[property];
  }

  if (!isUndefined(operation)) {
    if (!isUndefined(operation.parameters)) {
      dict = getParameterObject(
        propertyKey,
        pipeRecord,
        operation as OperationObject
      );
    } else {
    }
    dict = operation;
  }

  cb({
    pipeRecord,
    schema: dict,
    builder,
  });
}

export function isSchema(schema: SchemaObject | ParameterObject) {
  return isUndefined(schema.in);
}
