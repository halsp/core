import { isClass, isUndefined } from "@sfajs/core";
import { PipeReqRecord } from "@sfajs/pipe";
import {
  OpenApiBuilder,
  OperationObject,
  ParameterObject,
  SchemaObject,
} from "openapi3-ts";
import { getPipeRecordModelType } from "../parser/utils/decorator";
import { pipeTypeToDocType } from "../parser/utils/doc-types";
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

export function getSchemaPropertySchema(
  schema: SchemaObject,
  property: string,
  pipeRecord: PipeReqRecord,
  builder: OpenApiBuilder,
  target: any
) {
  if (!schema.properties) {
    schema.properties = {};
  }
  if (!schema.properties[property]) {
    const propertyCls = Reflect.getMetadata("design:type", target, property);
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
  return schema.properties[property];
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
    // schema property
    dict = getSchemaPropertySchema(
      schema,
      property,
      pipeRecord,
      builder,
      target
    );
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

function typeToApiType(
  type?: any
):
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "integer"
  | "null"
  | "array"
  | undefined {
  if (type == String) {
    return "string";
  } else if (type == Number) {
    return "number";
  } else if (type == BigInt) {
    return "integer";
  } else if (type == Boolean) {
    return "boolean";
  } else if (type == Array) {
    return "array";
  } else {
    return "object";
  }
}
