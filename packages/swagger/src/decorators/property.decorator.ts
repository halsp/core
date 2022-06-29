import { isClass } from "@sfajs/core";
import { ParameterObject, SchemaObject } from "openapi3-ts";
import { MODEL_PROPERTIES } from "../constant";
import { PropertyDecItem } from "../property-dec-item";

function createPropertyDecorator(key: keyof ParameterObject, value?: any) {
  return function (target: any, propertyKey: string) {
    const propertyDecs: PropertyDecItem[] =
      Reflect.getMetadata(MODEL_PROPERTIES, target) ?? [];
    if (key) {
      propertyDecs.push({
        propertyKey,
        key,
        value,
      });
    }
    Reflect.defineMetadata(MODEL_PROPERTIES, propertyDecs, target);
  };
}

export const ApiProperty = createPropertyDecorator("");

export function PropertyDescription(description: string) {
  return createPropertyDecorator("description", description);
}

export function PropertyIgnore(ignore: boolean) {
  return createPropertyDecorator("ignore", ignore);
}

export function PropertySchema(schema: SchemaObject | ObjectConstructor) {
  if (isClass(schema)) {
    return createPropertyDecorator("schema", {
      $ref: `#/components/schemas/${schema.name}`,
    });
  } else {
    return createPropertyDecorator("schema", schema);
  }
}

export function PropertyDeprecated() {
  return createPropertyDecorator("deprecated", true);
}

export function PropertyRequired() {
  return createPropertyDecorator("required", true);
}

export function PropertyAllowEmptyValue() {
  return createPropertyDecorator("allowEmptyValue", true);
}
