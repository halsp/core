import { isClass, isUndefined, ObjectConstructor } from "@sfajs/core";
import {
  ExampleObject,
  ParameterStyle,
  SchemaObject,
  XmlObject,
} from "openapi3-ts";
import { IGNORE } from "../constant";
import { ensureModelSchema } from "../parser/utils/model-schema";
import {
  createPropertyCallbackDecorator,
  createPropertySetValueCallbackDecorator,
  isSchema,
  setPropertyValue,
} from "./property.decorator";

export function PropertyDescription(description: string) {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.description = description;
  });
}

export function PropertyDefault(value: any) {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.default = value;
  });
}

export function PropertyTitle(value: string) {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.title = value;
  });
}

export function PropertyReadOnly() {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.readOnly = true;
  });
}

export function PropertyWriteOnly() {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.writeOnly = true;
  });
}

export function PropertyPattern(pattern: string) {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.pattern = pattern;
  });
}

export function PropertyIgnore() {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema[IGNORE] = true;
  });
}

export function PropertyParameterSchema(
  value: SchemaObject | ObjectConstructor
) {
  return createPropertySetValueCallbackDecorator(
    ({ schema, builder, pipeRecord }) => {
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
    }
  );
}

export function PropertyDeprecated() {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.deprecated = true;
  });
}

export function PropertyRequired() {
  return createPropertyCallbackDecorator(
    ({
      target,
      propertyKey,
      parameterIndex,
      schema,
      parameter,
      pipeRecord,
      builder,
    }) => {
      const property = pipeRecord.property ?? (propertyKey as string);
      if (!isUndefined(schema)) {
        if (!schema.required) {
          schema.required = [];
        }
        schema.required.push(property);
        setPropertyValue(
          ({ schema: propertySchema }) => {
            delete propertySchema.nullable;
          },
          target,
          property,
          parameterIndex,
          pipeRecord,
          builder,
          schema,
          parameter
        );
      }
      if (!isUndefined(parameter)) {
        parameter.required = true;
      }
    }
  );
}

export function PropertyAllowEmptyValue() {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    if (!isSchema(schema)) {
      schema.allowEmptyValue = true;
    }
  });
}

export function PropertyBodyArrayType(value: SchemaObject | ObjectConstructor) {
  return createPropertySetValueCallbackDecorator(
    ({ schema, builder, pipeRecord }) => {
      if (isClass(value)) {
        ensureModelSchema(builder, value, pipeRecord);
        schema.items = {
          $ref: `#/components/schemas/${value.name}`,
        };
      } else {
        schema.items = value;
      }
    }
  );
}

export function PropertyExample(example: any) {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.example = example;
  });
}

export function PropertyExamples(examples: Record<string, ExampleObject>) {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.examples = examples;
  });
}

export function PropertyParameterStyle(style: ParameterStyle) {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.style = style;
  });
}

export function PropertyNumRange(args: { min?: number; max?: number }) {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.minLength = args.min;
    schema.maxLength = args.max;
  });
}

export function PropertyPropertiesRange(args: { min?: number; max?: number }) {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.minProperties = args.min;
    schema.maxProperties = args.max;
  });
}

export function PropertyFormat(
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
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.format = format;
  });
}

export function PropertyXml(value: XmlObject) {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.xml = value;
  });
}

export function PropertyEnum(...value: any[]) {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema.enum = value;
  });
}
