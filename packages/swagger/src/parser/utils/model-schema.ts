import { ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord } from "@sfajs/pipe";
import { ComponentsObject, OpenApiBuilder, SchemaObject } from "openapi3-ts";
import { PipeSchemaCallback } from "../../decorators/callback.decorator";
import { getCallbacks } from "./decorator";

function createModelPropertySchema(
  builder: OpenApiBuilder,
  modelCls: ObjectConstructor,
  pipeRecord: PipeReqRecord
) {
  const callbacks = getCallbacks(modelCls);
  const schema = getSchema(builder, modelCls);
  for (const cb of callbacks) {
    (cb as PipeSchemaCallback)({
      pipeRecord,
      schema,
      builder,
    });
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

export function ensureModelSchema(
  builder: OpenApiBuilder,
  modelCls: ObjectConstructor,
  pipeRecord: PipeReqRecord
) {
  const schema = getExistSchema(builder, modelCls.name);
  if (!schema) {
    createModelPropertySchema(builder, modelCls, pipeRecord);
  }
}
