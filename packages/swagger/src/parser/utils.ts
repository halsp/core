import { isClass, isUndefined, ObjectConstructor } from "@ipare/core";
import { PipeReqType } from "@ipare/pipe";
import { getRules, RuleRecord, V, ValidateItem } from "@ipare/validator";
import {
  ComponentsObject,
  OpenApiBuilder,
  ParameterLocation,
  ReferenceObject,
  SchemaObject,
} from "openapi3-ts";
import { setSchemaValue } from "./schema-dict";

export const lib = V();

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
  builder: OpenApiBuilder,
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
  const propertiesRules = rules.reduce((prev, cur) => {
    (prev[cur.propertyKey as string] =
      prev[cur.propertyKey as string] || []).push(cur);
    return prev;
  }, {});
  for (const property in propertiesObject) {
    const propertyRules = propertiesRules[property];
    if (existIgnore(rules)) {
      continue;
    }

    parsePropertyModel(
      builder,
      propertiesObject,
      modelType,
      property,
      propertyRules
    );

    if ((propertiesObject[property] as SchemaObject).nullable == false) {
      requiredProperties.push(property);
    }
  }
}

export function parsePropertyModel(
  builder: OpenApiBuilder,
  propertiesObject: Record<string, SchemaObject | ReferenceObject>,
  modelType: ObjectConstructor,
  property: string,
  rules: RuleRecord[]
) {
  const propertyCls = Reflect.getMetadata("design:type", modelType, property);

  if (isClass(propertyCls)) {
    propertiesObject[property] = {
      $ref: `#/components/schemas/${propertyCls.name}`,
    } as ReferenceObject;
    setSchemaValue(builder, propertiesObject[property] as SchemaObject, rules);
    setComponentModelSchema(builder, propertyCls);
  } else {
    const propertySchema = {
      type: typeToApiType(propertyCls),
    } as SchemaObject;
    propertiesObject[property] = propertySchema;
    setSchemaValue(builder, propertySchema, rules);
  }
}

export function setComponentModelSchema(
  builder: OpenApiBuilder,
  modelType: ObjectConstructor
) {
  let schema = tryGetComponentSchema(builder, modelType.name);
  if (!schema) {
    schema = getComponentSchema(builder, modelType.name);
    setModelSchema(builder, modelType, schema);
  }
}

function getComponentSchema(
  builder: OpenApiBuilder,
  name: string
): SchemaObject {
  let schema = tryGetComponentSchema(builder, name);
  if (!schema) {
    schema = {
      type: "object",
      properties: {},
    };
    builder.addSchema(name, schema);
  }
  return schema;
}

function tryGetComponentSchema(
  builder: OpenApiBuilder,
  name: string
): SchemaObject | undefined {
  const components = builder.getSpec().components as ComponentsObject;
  const schemas = components.schemas as Record<string, SchemaObject>;
  return schemas[name];
}

export function getNamedValidates(rules: RuleRecord[], name: string) {
  const validates: ValidateItem[] = [];
  rules.forEach((r) => {
    validates.push(...r.validates.filter((v) => v.name == name));
  });
  return validates;
}

export function existIgnore(rules: RuleRecord[]) {
  return rules.some((r) => r.validates.some((v) => v.name == lib.Ignore.name));
}
