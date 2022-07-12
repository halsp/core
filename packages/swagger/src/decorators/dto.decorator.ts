import { PipeReqRecord } from "@ipare/pipe";
import {
  ExampleObject,
  OpenApiBuilder,
  OperationObject,
  ParameterObject,
  SchemaObject,
  XmlObject,
  ParameterStyle,
} from "openapi3-ts";
import { createCallbackDecorator } from "./callback.decorator";
import { setPropertyValue } from "./set-property-value";
import { isClass, isUndefined, ObjectConstructor } from "@ipare/core";
import { IGNORE } from "../constant";
import { ensureModelSchema } from "../parser/utils/model-schema";
import { isParameterObject, isSchemaObject } from "./callback-dict-type";

export type SetDtoValueCallback = (args: {
  pipeRecord: PipeReqRecord;
  schema: SchemaObject | ParameterObject | OperationObject;
  builder: OpenApiBuilder;
}) => void;

export function createDtoDecorator(callback: SetDtoValueCallback) {
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
          cb: ({ schema: parameter }) => {
            callback({
              pipeRecord,
              schema: parameter,
              builder,
            });
            callback({
              pipeRecord,
              schema: parameter.schema,
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

export function DtoDescription(description: string) {
  return createDtoDecorator(({ schema }) => {
    schema.description = description;
  });
}

export function DtoIgnore() {
  return createDtoDecorator(({ schema }) => {
    schema[IGNORE] = true;
  });
}

export function DtoDefault(value: any) {
  return createDtoDecorator(({ schema }) => {
    schema.default = value;
  });
}

export function DtoTitle(value: string) {
  return createDtoDecorator(({ schema }) => {
    schema.title = value;
  });
}

export function DtoReadOnly() {
  return createDtoDecorator(({ schema }) => {
    schema.readOnly = true;
  });
}

export function DtoWriteOnly() {
  return createDtoDecorator(({ schema }) => {
    schema.writeOnly = true;
  });
}

export function DtoPattern(pattern: string) {
  return createDtoDecorator(({ schema }) => {
    schema.pattern = pattern;
  });
}

export function DtoSchema(
  value: ((schema: SchemaObject) => SchemaObject | void) | ObjectConstructor
) {
  return createDtoDecorator(({ schema, builder, pipeRecord }) => {
    if (isParameterObject(schema)) {
      if (isClass(value)) {
        ensureModelSchema(builder, value, pipeRecord);
        schema.schema = {
          $ref: `#/components/schemas/${value.name}`,
        };
      } else {
        schema.schema = value(schema.schema as SchemaObject) ?? schema.schema;
      }
    }

    if (isSchemaObject(schema)) {
      if (isClass(value)) {
        schema["$ref"] = `#/components/schemas/${value.name}`;
      } else {
        schema = value(schema) ?? schema;
      }
    }
  });
}

export function DtoDeprecated() {
  return createDtoDecorator(({ schema }) => {
    schema.deprecated = true;
  });
}

export function DtoRequired() {
  return createCallbackDecorator(
    ({ target, propertyKey, schema, operation, pipeRecord, builder }) => {
      const property = pipeRecord.property ?? (propertyKey as string);
      if (!isUndefined(schema)) {
        if (!schema.required) {
          schema.required = [];
        }
        schema.required.push(property);
        setPropertyValue({
          cb: ({ schema: propertySchema }) => {
            delete propertySchema.nullable;
          },
          target,
          propertyKey,
          pipeRecord,
          builder,
          schema,
        });
      }
      if (!isUndefined(operation)) {
        setPropertyValue({
          cb: ({ schema: parameter }) => {
            parameter.required = true;
            parameter.schema.required = true;
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

export function DtoAllowEmptyValue() {
  return createDtoDecorator(({ schema }) => {
    if (!isSchemaObject(schema)) {
      schema.allowEmptyValue = true;
    }
  });
}

export function DtoArrayType(value: SchemaObject | ObjectConstructor) {
  return createDtoDecorator(({ schema, builder, pipeRecord }) => {
    if (isClass(value)) {
      ensureModelSchema(builder, value, pipeRecord);
      schema.items = {
        $ref: `#/components/schemas/${value.name}`,
      };
    } else {
      schema.items = value;
    }
    schema.type = "array";
  });
}

export function DtoExample(example: any) {
  return createDtoDecorator(({ schema }) => {
    schema.example = example;
  });
}

export function DtoExamples(examples: Record<string, ExampleObject>) {
  return createDtoDecorator(({ schema }) => {
    schema.examples = examples;
  });
}

export function DtoParameterStyle(style: ParameterStyle) {
  return createDtoDecorator(({ schema }) => {
    schema.style = style;
  });
}

export function DtoNumRange(args: { min?: number; max?: number }) {
  return createDtoDecorator(({ schema }) => {
    schema.minimum = args.min;
    schema.maximum = args.max;
  });
}

export function DtoPropertiesRange(args: { min?: number; max?: number }) {
  return createDtoDecorator(({ schema }) => {
    schema.minProperties = args.min;
    schema.maxProperties = args.max;
  });
}

export function DtoLengthRange(args: { min?: number; max?: number }) {
  return createDtoDecorator(({ schema }) => {
    schema.minLength = args.min;
    schema.maxLength = args.max;
  });
}

export function DtoFormat(
  format:
    | "int32"
    | "int64"
    | "float"
    | "double"
    | "byte"
    | "binary"
    | "date"
    | "date-time"
    | "password"
    | string
) {
  return createDtoDecorator(({ schema }) => {
    schema.format = format;
  });
}

export function DtoType(
  type:
    | "integer"
    | "number"
    | "string"
    | "boolean"
    | "object"
    | "null"
    | "array"
) {
  return createDtoDecorator(({ schema }) => {
    schema.type = type;
  });
}

export function DtoXml(value: XmlObject) {
  return createDtoDecorator(({ schema }) => {
    schema.xml = value;
  });
}

export function DtoEnum(...value: any[]) {
  return createDtoDecorator(({ schema }) => {
    schema.enum = value;
  });
}
