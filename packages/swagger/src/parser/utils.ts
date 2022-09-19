import { isClass, isUndefined, ObjectConstructor } from "@ipare/core";
import { PipeReqType } from "@ipare/pipe";
import {
  getRules,
  RuleRecord,
  V,
  ValidateItem,
  ValidatorDecoratorReturnType,
} from "@ipare/validator";
import {
  ComponentsObject,
  OpenApiBuilder,
  ParameterLocation,
  ReferenceObject,
  SchemaObject,
} from "openapi3-ts-remove-yaml";
import { ArrayItemType, setSchemaValue } from "./schema-dict";

export const lib = V;
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

  const rules = getRules(modelType);
  setSchemaValue(
    builder,
    schema,
    rules.filter(
      (r) => isUndefined(r.propertyKey) && isUndefined(r.parameterIndex)
    )
  );

  const requiredProperties: string[] = [];
  schema.required = requiredProperties;

  const propertiesRules = rules
    .filter((rule) => !isUndefined(rule.propertyKey))
    .reduce((prev, cur) => {
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
  if (!requiredProperties.length) {
    delete schema.required;
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

  const type = typeToApiType(propertyCls);
  if (type == "array") {
    propertiesObject[propertyKey] = {
      type: type,
      items: {},
    };
    getNamedValidates(rules, lib.Items.name).forEach((v) => {
      parseArraySchema(
        builder,
        propertiesObject[propertyKey] as SchemaObject,
        lib,
        v.args[0] as ArrayItemType
      );
    });
  } else if (isClass(propertyCls)) {
    propertiesObject[propertyKey] = {
      $ref: `#/components/schemas/${propertyCls.name}`,
    } as ReferenceObject;
    setComponentModelSchema(builder, propertyCls);
  } else {
    propertiesObject[propertyKey] = {
      type: typeToApiType(propertyCls),
    };
    setSchemaValue(
      builder,
      propertiesObject[propertyKey] as SchemaObject,
      rules
    );
  }
}

export function setComponentModelSchema(
  builder: OpenApiBuilder,
  modelType: ObjectConstructor,
  extendRules?: RuleRecord[]
) {
  let schema = tryGetComponentSchema(builder, modelType.name);
  if (!schema) {
    schema = getComponentSchema(builder, modelType.name);

    if (extendRules) {
      setSchemaValue(builder, schema, extendRules);
    }
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

export function parseArraySchema(
  builder: OpenApiBuilder,
  target: SchemaObject,
  lib: ValidatorDecoratorReturnType,
  schemaValue: ArrayItemType
) {
  const type = typeToApiType(schemaValue);
  if (Array.isArray(schemaValue)) {
    delete target["$ref"];
    target.items = {
      type: "array",
    };
    schemaValue.forEach((sv) => {
      parseArraySchema(builder, target.items as SchemaObject, lib, sv);
    });
  } else if (type == "object") {
    if (isClass(schemaValue)) {
      setComponentModelSchema(builder, schemaValue);
      target.items = {
        $ref: `#/components/schemas/${schemaValue.name}`,
      } as ReferenceObject;
    } else {
      target.items = schemaValue;
    }
  } else {
    target.items = {
      type: type,
    };
  }
}
