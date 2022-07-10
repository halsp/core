import { isClass, isUndefined, ObjectConstructor } from "@sfajs/core";
import {
  ExampleObject,
  SchemaObject,
  XmlObject,
  ParameterStyle,
} from "openapi3-ts";
import { IGNORE } from "../constant";
import { ensureModelSchema } from "../parser/utils/model-schema";
import { isParameterObject, isSchemaObject } from "./callback-dict-type";
import { createCallbackDecorator } from "./callback.decorator";
import { createModelDecorator } from "./common.decorator";
import { setPropertyValue } from "./set-property-value";

export * from "./callback.decorator";
export * from "./action.decorator";
export * from "./common.decorator";
export * from "./set-property-value";

export function Description(description: string) {
  return createModelDecorator(({ schema }) => {
    schema.description = description;
  });
}

export function Ignore() {
  return createModelDecorator(({ schema }) => {
    schema[IGNORE] = true;
  });
}

export function Default(value: any) {
  return createModelDecorator(({ schema }) => {
    schema.default = value;
  });
}

export function Title(value: string) {
  return createModelDecorator(({ schema }) => {
    schema.title = value;
  });
}

export function ReadOnly() {
  return createModelDecorator(({ schema }) => {
    schema.readOnly = true;
  });
}

export function WriteOnly() {
  return createModelDecorator(({ schema }) => {
    schema.writeOnly = true;
  });
}

export function Pattern(pattern: string) {
  return createModelDecorator(({ schema }) => {
    schema.pattern = pattern;
  });
}

export function Schema(
  value: ((schema: SchemaObject) => SchemaObject | void) | ObjectConstructor
) {
  return createModelDecorator(({ schema, builder, pipeRecord }) => {
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

export function Deprecated() {
  return createModelDecorator(({ schema }) => {
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

export function AllowEmptyValue() {
  return createModelDecorator(({ schema }) => {
    if (!isSchemaObject(schema)) {
      schema.allowEmptyValue = true;
    }
  });
}

export function ArrayType(value: SchemaObject | ObjectConstructor) {
  return createModelDecorator(({ schema, builder, pipeRecord }) => {
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
  return createModelDecorator(({ schema }) => {
    schema.example = example;
  });
}

export function Examples(examples: Record<string, ExampleObject>) {
  return createModelDecorator(({ schema }) => {
    schema.examples = examples;
  });
}

export function ParameterStyle(style: ParameterStyle) {
  return createModelDecorator(({ schema }) => {
    schema.style = style;
  });
}

export function NumRange(args: { min?: number; max?: number }) {
  return createModelDecorator(({ schema }) => {
    schema.minimum = args.min;
    schema.maximum = args.max;
  });
}

export function PropertiesRange(args: { min?: number; max?: number }) {
  return createModelDecorator(({ schema }) => {
    schema.minProperties = args.min;
    schema.maxProperties = args.max;
  });
}

export function LengthRange(args: { min?: number; max?: number }) {
  return createModelDecorator(({ schema }) => {
    schema.minLength = args.min;
    schema.maxLength = args.max;
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
  return createModelDecorator(({ schema }) => {
    schema.format = format;
  });
}

export function Type(
  type:
    | "integer"
    | "number"
    | "string"
    | "boolean"
    | "object"
    | "null"
    | "array"
) {
  return createModelDecorator(({ schema }) => {
    schema.type = type;
  });
}

export function Xml(value: XmlObject) {
  return createModelDecorator(({ schema }) => {
    schema.xml = value;
  });
}

export function Enum(...value: any[]) {
  return createModelDecorator(({ schema }) => {
    schema.enum = value;
  });
}
