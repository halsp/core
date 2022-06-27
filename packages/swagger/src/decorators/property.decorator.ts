import { ParameterObject, SchemaObject } from "openapi3-ts";
import { MODEL_PROPERTIES } from "../constant";
import { PropertyDecItem } from "../property-dec-item";

function createPropertyDecorator(key: keyof ParameterObject, value?: any) {
  return function (target: any, propertyKey: string) {
    const propertyDecs: PropertyDecItem[] =
      Reflect.getMetadata(MODEL_PROPERTIES, target, propertyKey) ?? [];
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

export function PropertySchema(schema: SchemaObject) {
  return createPropertyDecorator("schema", schema);
}
