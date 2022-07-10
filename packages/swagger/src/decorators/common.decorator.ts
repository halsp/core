import { isClass, isUndefined, ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord } from "@sfajs/pipe";
import {
  ExampleObject,
  OpenApiBuilder,
  OperationObject,
  ParameterObject,
  ParameterStyle,
  SchemaObject,
  XmlObject,
} from "openapi3-ts";
import { IGNORE } from "../constant";
import { ensureModelSchema } from "../parser/utils/model-schema";
import { createCallbackDecorator } from "./callback.decorator";
import { setPropertyValue } from "./set-property-value";

function isSchema(schema: SchemaObject | ParameterObject) {
  return isUndefined(schema.in);
}

type SetCommonValueCallback = (args: {
  pipeRecord: PipeReqRecord;
  schema: SchemaObject | ParameterObject | OperationObject;
  builder: OpenApiBuilder;
}) => void;

function createCommonDecorator(callback: SetCommonValueCallback) {
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

export function Description(description: string) {
  return createCommonDecorator(({ schema }) => {
    schema.description = description;
  });
}

export function Ignore() {
  return createCommonDecorator(({ schema }) => {
    schema[IGNORE] = true;
  });
}

export function Defaul(value: any) {
  return createCommonDecorator(({ schema }) => {
    schema.default = value;
  });
}

export function Title(value: string) {
  return createCommonDecorator(({ schema }) => {
    schema.title = value;
  });
}

export function ReadOnly() {
  return createCommonDecorator(({ schema }) => {
    schema.readOnly = true;
  });
}

export function WriteOnly() {
  return createCommonDecorator(({ schema }) => {
    schema.writeOnly = true;
  });
}

export function Pattern(pattern: string) {
  return createCommonDecorator(({ schema }) => {
    schema.pattern = pattern;
  });
}

export function ParameterSchema(value: SchemaObject | ObjectConstructor) {
  return createCommonDecorator(({ schema, builder, pipeRecord }) => {
    if (!isSchema(schema)) {
      if (isClass(value)) {
        ensureModelSchema(builder, value, pipeRecord);
        schema.schema = {
          $ref: `#/components/schemas/${value.name}`,
        };
      } else {
        schema.schema = value;
      }
    }
  });
}

export function Deprecated() {
  return createCommonDecorator(({ schema }) => {
    schema.deprecated = true;
  });
}

export function Required() {
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
          cb: ({ schema: propertySchema }) => {
            propertySchema.required = true;
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

export function AllowEmptyValue() {
  return createCommonDecorator(({ schema }) => {
    if (!isSchema(schema)) {
      schema.allowEmptyValue = true;
    }
  });
}

export function ArrayType(value: SchemaObject | ObjectConstructor) {
  return createCommonDecorator(({ schema, builder, pipeRecord }) => {
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

export function Example(example: any) {
  return createCommonDecorator(({ schema }) => {
    schema.example = example;
  });
}

export function Examples(examples: Record<string, ExampleObject>) {
  return createCommonDecorator(({ schema }) => {
    schema.examples = examples;
  });
}

export function ParameterStyle(style: ParameterStyle) {
  return createCommonDecorator(({ schema }) => {
    schema.style = style;
  });
}

export function NumRange(args: { min?: number; max?: number }) {
  return createCommonDecorator(({ schema }) => {
    schema.minLength = args.min;
    schema.maxLength = args.max;
  });
}

export function PropertiesRange(args: { min?: number; max?: number }) {
  return createCommonDecorator(({ schema }) => {
    schema.minProperties = args.min;
    schema.maxProperties = args.max;
  });
}

export function Format(
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
  return createCommonDecorator(({ schema }) => {
    schema.format = format;
  });
}

export function Xml(value: XmlObject) {
  return createCommonDecorator(({ schema }) => {
    schema.xml = value;
  });
}

export function Enum(...value: any[]) {
  return createCommonDecorator(({ schema }) => {
    schema.enum = value;
  });
}
