import { ObjectConstructor } from "@sfajs/core";
import { PipeReqType } from "@sfajs/pipe";
import { ComponentsObject, OpenApiBuilder, SchemaObject } from "openapi3-ts";
import { getModelDecorators } from "./decorator";

export function createModelSchema(
  builder: OpenApiBuilder,
  modelCls: ObjectConstructor,
  type: PipeReqType
) {
  let schema = getExistSchema(builder, modelCls.name);
  if (!schema) {
    schema = {
      type: "object",
    };
    builder.addSchema(modelCls.name, schema);
  }

  const decs = getModelDecorators(modelCls);
  for (const fn of decs) {
    fn({
      type: type,
      schema: schema,
      builder: builder,
    });
  }
}

export function ensureModelSchema(
  builder: OpenApiBuilder,
  modelCls: ObjectConstructor,
  type: PipeReqType
) {
  const schema = getExistSchema(builder, modelCls.name);
  if (!schema) {
    createModelSchema(builder, modelCls, type);
  }
}

function getExistSchema(builder: OpenApiBuilder, name: string) {
  const components = builder.getSpec().components as ComponentsObject;
  const schemas = components.schemas as Record<string, SchemaObject>;
  return schemas[name] as SchemaObject;
}
