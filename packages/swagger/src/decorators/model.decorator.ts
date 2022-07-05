import { OpenApiBuilder, ParameterObject, SchemaObject } from "openapi3-ts";
import { IGNORE, MODEL_DECORATORS } from "../constant";

export type ModelDecoratorFn = (args: {
  schema: SchemaObject | ParameterObject[];
  builder: OpenApiBuilder;
}) => void;

type CreateDecoratorFn = (args: {
  schema: SchemaObject | ParameterObject;
  target: any;
  builder: OpenApiBuilder;
}) => void;

function createModelDecorator(fn: CreateDecoratorFn) {
  return function (target: any) {
    const propertyDecs: ModelDecoratorFn[] =
      Reflect.getMetadata(MODEL_DECORATORS, target) ?? [];
    propertyDecs.push(({ schema, builder }) => {
      fn({ schema, target, builder });
    });
    Reflect.defineMetadata(MODEL_DECORATORS, propertyDecs, target);
  };
}

export function ModelIgnore() {
  return createModelDecorator(({ schema }) => {
    schema[IGNORE] = true;
  });
}
