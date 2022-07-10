import { isUndefined } from "@sfajs/core";
import { PipeReqRecord } from "@sfajs/pipe";
import {
  OpenApiBuilder,
  OperationObject,
  ParameterObject,
  SchemaObject,
} from "openapi3-ts";
import { createCallbackDecorator } from "./callback.decorator";
import { setPropertyValue } from "./set-property-value";

export function isSchema(
  schema: SchemaObject | ParameterObject | OperationObject
) {
  return isUndefined(schema.in) && isUndefined(schema.parameters);
}

export type SetCommonValueCallback = (args: {
  pipeRecord: PipeReqRecord;
  schema: SchemaObject | ParameterObject | OperationObject;
  builder: OpenApiBuilder;
}) => void;

export function createCommonDecorator(callback: SetCommonValueCallback) {
  return createCallbackDecorator(
    ({
      target,
      propertyKey,
      schema,
      operation,
      pipeRecord,
      builder,
      parameterIndex,
    }) => {
      if (!isUndefined(schema)) {
        if (isUndefined(propertyKey) && isUndefined(parameterIndex)) {
          callback({
            pipeRecord,
            schema,
            builder,
          });
        } else {
          setPropertyValue({
            cb: ({ schema: propertySchema }) => {
              callback({
                pipeRecord,
                schema: propertySchema,
                builder,
              });
            },
            target,
            propertyKey,
            pipeRecord,
            builder,
            schema,
          });
        }
      }

      if (!isUndefined(operation)) {
        setPropertyValue({
          cb: ({ schema: propertySchema }) => {
            callback({
              pipeRecord,
              schema: propertySchema,
              builder,
            });
          },
          target,
          propertyKey,
          pipeRecord,
          builder,
          operation,
        });
      }
    }
  );
}
