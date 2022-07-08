import { isUndefined, ObjectConstructor } from "@sfajs/core";
import { PipeReqType } from "@sfajs/pipe";
import { ComponentsObject, OpenApiBuilder, SchemaObject } from "openapi3-ts";
import { getModelDecorators, getModelPropertyDecorators } from "./decorator";

function createModelPropertySchema(
  builder: OpenApiBuilder,
  modelCls: ObjectConstructor,
  pipeType: PipeReqType
) {
  const decs = getModelPropertyDecorators(modelCls);
  const schema = getSchema(builder, modelCls);
  for (const fn of decs) {
    fn({
      pipeType,
      schema,
      builder,
    });
  }
}

function createModelSchema(
  builder: OpenApiBuilder,
  modelCls: ObjectConstructor
) {
  const decs = getModelDecorators(modelCls);
  if (!decs.length) {
    return;
  }

  const schema = getSchema(builder, modelCls);
  for (const fn of decs) {
    fn({
      schema: schema,
      builder: builder,
    });
  }
}

export function ensureModelSchema(
  builder: OpenApiBuilder,
  modelCls: ObjectConstructor,
  pipeType?: PipeReqType
) {
  const schema = getExistSchema(builder, modelCls.name);
  if (!schema) {
    if (isUndefined(pipeType)) {
      createModelSchema(builder, modelCls);
    } else {
      createModelPropertySchema(builder, modelCls, pipeType);
    }
  }
}

function getSchema(builder: OpenApiBuilder, modelCls: ObjectConstructor) {
  let schema = getExistSchema(builder, modelCls.name);
  if (!schema) {
    schema = {
      type: "object",
    };
    builder.addSchema(modelCls.name, schema);
  }
  return schema;
}

function getExistSchema(builder: OpenApiBuilder, name: string) {
  const components = builder.getSpec().components as ComponentsObject;
  const schemas = components.schemas as Record<string, SchemaObject>;
  return schemas[name] as SchemaObject;
}
