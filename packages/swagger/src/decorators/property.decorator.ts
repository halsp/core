import { MODEL_PROPERTIES } from "../constant";

function createPropertyDecorator(key: string, value: any) {
  return function (target: any, propertyKey: string) {
    const property =
      Reflect.getMetadata(MODEL_PROPERTIES, target, propertyKey) ?? {};
    property[key] = value;
    Reflect.defineMetadata(MODEL_PROPERTIES, property, target);
  };
}

export function PropertySummary(summary: string) {
  return createPropertyDecorator("summary", summary);
}
