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
import { createCommonDecorator } from "./common.decorator";
import { setPropertyValue } from "./set-property-value";

export * from "./callback.decorator";
export * from "./action.decorator";
export * from "./common.decorator";
export * from "./set-property-value";

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

export function Default(value: any) {
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

export function Schema(
  value: ((schema: SchemaObject) => SchemaObject | void) | ObjectConstructor
) {
  return createCommonDecorator(({ schema, builder, pipeRecord }) => {
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
  return createCommonDecorator(({ schema }) => {
    if (!isSchemaObject(schema)) {
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
    schema.minimum = args.min;
    schema.maximum = args.max;
  });
}

export function PropertiesRange(args: { min?: number; max?: number }) {
  return createCommonDecorator(({ schema }) => {
    schema.minProperties = args.min;
    schema.maxProperties = args.max;
  });
}

export function LengthRange(args: { min?: number; max?: number }) {
  return createCommonDecorator(({ schema }) => {
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
  return createCommonDecorator(({ schema }) => {
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
  return createCommonDecorator(({ schema }) => {
    schema.type = type;
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
