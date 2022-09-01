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
export const jsonTypes = ["application/json"];

export function typeToApiType(
  type?: any
): "string" | "number" | "boolean" | "object" | "integer" | "null" | "array" {
  if (!type) {
    return "null";
  } else if (type == String) {
    return "string";
  } else if (type == Number) {
    return "number";
  } else if (type == Boolean) {
    return "boolean";
  } else if (type == Array) {
    return "array";
  } else if (type == Date) {
    return "string";
  } else {
    return "object";
  }
}

export function typeToFormatType(type?: any) {
  if (!type) {
    return undefined;
  } else if (type == String) {
    return "string";
  } else if (type == Number) {
    return "int32";
  } else if (type == Date) {
    return "date";
  } else {
    return undefined;
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
  for (const propertyKey in propertiesRules) {
    const propertyRules = propertiesRules[propertyKey];
    if (existIgnore(propertyRules)) {
      continue;
    }

    parseModelProperty(
      builder,
      propertiesObject,
      modelType,
      propertyKey,
      propertyRules
    );

    if ((propertiesObject[propertyKey] as SchemaObject).nullable == false) {
      requiredProperties.push(propertyKey);
    }
  }
}

export function parseModelProperty(
  builder: OpenApiBuilder,
  propertiesObject: Record<string, SchemaObject | ReferenceObject>,
  modelType: ObjectConstructor,
  propertyKey: string,
  rules: RuleRecord[]
) {
  const propertyCls = Reflect.getMetadata(
    "design:type",
    modelType.prototype,
    propertyKey
  );

  if (isClass(propertyCls)) {
    propertiesObject[propertyKey] = {
      $ref: `#/components/schemas/${propertyCls.name}`,
    } as ReferenceObject;
    setSchemaValue(
      builder,
      propertiesObject[propertyKey] as SchemaObject,
      rules
    );
    setComponentModelSchema(builder, propertyCls);
  } else {
    const propertySchema = {
      type: typeToApiType(propertyCls),
      format: typeToFormatType(propertyCls),
    } as SchemaObject;
    propertiesObject[propertyKey] = propertySchema;
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
