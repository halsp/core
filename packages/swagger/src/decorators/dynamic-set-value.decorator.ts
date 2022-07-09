import { isClass, isUndefined } from "@sfajs/core";
import { PipeReqRecord } from "@sfajs/pipe";
import {
  OpenApiBuilder,
  OperationObject,
  ParameterObject,
  SchemaObject,
} from "openapi3-ts";
import { getPipeRecordModelType } from "../parser/utils/decorator";
import { pipeTypeToDocType, typeToApiType } from "../parser/utils/doc-types";
import { ensureModelSchema } from "../parser/utils/model-schema";

export function getParameterObject(
  propertyKey: string,
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

export type SetValueCallback = (args: {
  pipeRecord: PipeReqRecord;
  schema: SchemaObject | ParameterObject | OperationObject;
  builder: OpenApiBuilder;
}) => void;

export function dynamicSetValue(args: {
  cb: SetValueCallback;
  target: any;
  propertyKey?: string;
  pipeRecord: PipeReqRecord;
  builder: OpenApiBuilder;
  schema?: SchemaObject;
  operation?: OperationObject;
  parameter?: ParameterObject;
}) {
  const {
    cb,
    target,
    propertyKey,
    pipeRecord,
    builder,
    schema,
    operation,
    parameter,
  } = args;

  const property = pipeRecord.property ?? propertyKey;
  if (!property) return;

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

    // schema property
    dict = schema.properties[property];
  } else if (!isUndefined(operation)) {
    // operation -> parameter
    dict = getParameterObject(
      property,
      pipeRecord,
      operation as OperationObject
    );
  } else if (!isUndefined(parameter)) {
    // parameter
    dict = parameter;
  }

  cb({
    pipeRecord,
    schema: dict,
    builder,
  });
}
