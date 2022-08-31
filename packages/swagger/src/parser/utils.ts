import { isUndefined, ObjectConstructor } from "@ipare/core";
import { PipeReqType } from "@ipare/pipe";
import { getRules, ValidatorDecoratorReturnType } from "@ipare/validator";
import {
  ComponentsObject,
  OpenApiBuilder,
  ParameterLocation,
  SchemaObject,
} from "openapi3-ts";
import { setSchemaValue } from "./schema-dict";

export function typeToApiType(
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

export function pipeTypeToDocType(pipeType: PipeReqType): ParameterLocation {
  if (pipeType == "body") {
    throw new Error();
  }

  switch (pipeType) {
    case "header":
      return "header";
    case "query":
      return "query";
    default:
      return "path";
  }
}

export function setModelSchema(
  lib: ValidatorDecoratorReturnType,
  modelType: ObjectConstructor,
  schema: SchemaObject
) {
  const propertiesObject = schema.properties as Exclude<
    typeof schema.properties,
    undefined
  >;
  const requiredProperties: string[] = [];
  schema.required = requiredProperties;

  const rules = getRules(modelType).filter(
    (rule) => !isUndefined(rule.propertyKey)
  );
  const properties = rules.reduce((prev, cur) => {
    (prev[cur.propertyKey as string] =
      prev[cur.propertyKey as string] || []).push(cur);
    return prev;
  }, {});
  Object.keys(properties).forEach((property) => {
    const propertyCls = Reflect.getMetadata("design:type", modelType, property);

    const propertySchema = {
      type: typeToApiType(propertyCls),
    } as SchemaObject;
    propertiesObject[property] = propertySchema;

    const propertyRules = properties[property];
    setSchemaValue(lib, propertySchema, propertyRules);

    if (propertySchema.nullable == false) {
      requiredProperties.push(property);
    }
  });
}

export function getComponentSchema(builder: OpenApiBuilder, name: string) {
  const components = builder.getSpec().components as ComponentsObject;
  const schemas = components.schemas as Record<string, SchemaObject>;
  let schema = schemas[name] as SchemaObject;
  if (!schema) {
    schema = {
      type: "object",
      properties: {},
    };
    builder.addSchema(name, schema);
  }
  return schema;
}
