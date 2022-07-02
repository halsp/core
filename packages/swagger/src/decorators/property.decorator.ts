import { isClass, isUndefined } from "@sfajs/core";
import { PipeReqType } from "@sfajs/pipe";
import {
  OpenApiBuilder,
  ParameterObject,
  ParameterStyle,
  SchemaObject,
  XmlObject,
} from "openapi3-ts";
import { MODEL_DECORATORS } from "../constant";
import { pipeTypeToDocType, typeToApiType } from "../parser/utils/doc-types";
import { ensureModelSchema } from "../parser/utils/model-schema";

export type DecoratorFn = (args: {
  type: PipeReqType;
  schema: SchemaObject | ParameterObject[];
  builder: OpenApiBuilder;
}) => void;

type SetSchemaValueDecoratorFn = (args: {
  type: PipeReqType;
  schema: SchemaObject | ParameterObject;
  builder: OpenApiBuilder;
}) => void;

type CreateDecoratorFn = (args: {
  type: PipeReqType;
  schema: SchemaObject | ParameterObject;
  target: any;
  propertyKey: string;
  builder: OpenApiBuilder;
}) => void;

function isSchemaObject(
  schema: SchemaObject | ParameterObject | ParameterObject[]
): schema is SchemaObject {
  return !Array.isArray(schema) && isUndefined(schema.in);
}

function getParameterObject(
  propertyKey: string,
  type: PipeReqType,
  schema: ParameterObject[]
) {
  const existParameter = schema.filter((p) => p.name == propertyKey)[0];
  const parameter = existParameter ?? {
    name: propertyKey,
    in: pipeTypeToDocType(type),
    required: type == "param",
  };
  if (!existParameter) {
    schema.push(parameter);
  }
  return parameter;
}

function setValue(
  target: any,
  propertyKey: string,
  type: PipeReqType,
  schema: SchemaObject | ParameterObject[],
  builder: OpenApiBuilder,
  fn: SetSchemaValueDecoratorFn
) {
  let dict: SchemaObject | ParameterObject;
  if (isSchemaObject(schema)) {
    if (!schema.properties) {
      schema.properties = {};
    }
    if (!schema.properties[propertyKey]) {
      const propertyCls = Reflect.getMetadata(
        "design:type",
        target,
        propertyKey
      );
      if (isClass(propertyCls)) {
        ensureModelSchema(builder, propertyCls, type);
        schema.properties[propertyKey] = {
          $ref: `#/components/schemas/${propertyCls.name}`,
        };
      } else {
        schema.properties[propertyKey] = {
          type: typeToApiType(propertyCls),
          nullable: true,
        };
      }
    }
    dict = schema.properties[propertyKey];
  } else {
    dict = getParameterObject(propertyKey, type, schema);
  }
  fn({
    type,
    schema: dict,
    builder,
  });
}

function createPropertyDecorator(fn: CreateDecoratorFn) {
  return function (target: any, propertyKey: string) {
    const propertyDecs: DecoratorFn[] =
      Reflect.getMetadata(MODEL_DECORATORS, target) ?? [];
    propertyDecs.push(({ type, schema, builder }) => {
      if (isSchemaObject(schema)) {
        fn({ type, propertyKey, schema, target, builder });
      } else {
        fn({
          type,
          propertyKey,
          schema: getParameterObject(propertyKey, type, schema),
          target,
          builder,
        });
      }
    });
    Reflect.defineMetadata(MODEL_DECORATORS, propertyDecs, target);
  };
}

function createPropertySetValueDecorator(fn: SetSchemaValueDecoratorFn) {
  return function (target: any, propertyKey: string | symbol) {
    const propertyDecs: DecoratorFn[] =
      Reflect.getMetadata(MODEL_DECORATORS, target) ?? [];
    propertyDecs.push(({ type, schema, builder }) =>
      setValue(target, propertyKey as string, type, schema, builder, fn)
    );
    Reflect.defineMetadata(MODEL_DECORATORS, propertyDecs, target);
  };
}

export function PropertyDescription(description: string) {
  return createPropertySetValueDecorator(({ schema }) => {
    schema.description = description;
  });
}

export function PropertyDefault(value: any) {
  return createPropertySetValueDecorator(({ schema }) => {
    schema.default = value;
  });
}

export function PropertyTitle(value: string) {
  return createPropertySetValueDecorator(({ schema }) => {
    schema.title = value;
  });
}

export function PropertyReadOnly() {
  return createPropertySetValueDecorator(({ schema }) => {
    schema.readOnly = true;
  });
}

export function PropertyWriteOnly() {
  return createPropertySetValueDecorator(({ schema }) => {
    schema.writeOnly = true;
  });
}

export function PropertyPattern(pattern: string) {
  return createPropertySetValueDecorator(({ schema }) => {
    schema.pattern = pattern;
  });
}

export function PropertyIgnore() {
  return createPropertyDecorator(() => undefined);
}

export function PropertyParameterSchema(
  value: SchemaObject | ObjectConstructor
) {
  return createPropertySetValueDecorator(({ schema, builder, type }) => {
    if (!isSchemaObject(schema)) {
      if (isClass(value)) {
        ensureModelSchema(builder, value, type);
        schema.schema = {
          $ref: `#/components/schemas/${schema.name}`,
        };
      } else {
        schema.schema = value;
      }
    }
  });
}

export function PropertyDeprecated() {
  return createPropertySetValueDecorator(({ schema }) => {
    schema.deprecated = true;
  });
}

export function PropertyRequired() {
  return createPropertyDecorator(
    ({ target, propertyKey, schema, type, builder }) => {
      if (isSchemaObject(schema)) {
        if (!schema.required) {
          schema.required = [];
        }
        schema.required.push(propertyKey);
        setValue(
          target,
          propertyKey,
          type,
          schema,
          builder,
          ({ schema: propertySchema }) => {
            delete propertySchema.nullable;
          }
        );
      } else {
        schema.required = true;
      }
    }
  );
}

export function PropertyAllowEmptyValue() {
  return createPropertySetValueDecorator(({ schema }) => {
    if (!isSchemaObject(schema)) {
      schema.allowEmptyValue = true;
    }
  });
}

export function PropertyBodyArrayType(value: SchemaObject | ObjectConstructor) {
  return createPropertySetValueDecorator(({ schema, builder, type }) => {
    if (isSchemaObject(schema)) {
      if (isClass(value)) {
        ensureModelSchema(builder, value, type);
        schema.items = {
          $ref: `#/components/schemas/${value.name}`,
        };
      } else {
        schema.schema = value;
      }
    }
  });
}

export function PropertyExample(examples: any[]): PropertyDecorator;
export function PropertyExample(example: any): PropertyDecorator;
export function PropertyExample(example: any) {
  return createPropertySetValueDecorator(({ schema }) => {
    if (Array.isArray(example)) {
      schema.examples = example;
    } else {
      schema.example = example;
    }
  });
}

export function PropertyParameterStyle(style: ParameterStyle) {
  return createPropertySetValueDecorator(({ schema }) => {
    schema.style = style;
  });
}

export function PropertyNumRange(args: { min?: number; max?: number }) {
  return createPropertySetValueDecorator(({ schema }) => {
    schema.minLength = args.min;
    schema.maxLength = args.max;
  });
}

export function PropertyPropertiesRange(args: { min?: number; max?: number }) {
  return createPropertySetValueDecorator(({ schema }) => {
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
  return createPropertySetValueDecorator(({ schema }) => {
    schema.format = format;
  });
}

export function PropertyXml(value: XmlObject) {
  return createPropertySetValueDecorator(({ schema }) => {
    schema.xml = value;
  });
}

export function PropertyEnum(...value: any[]) {
  return createPropertySetValueDecorator(({ schema }) => {
    schema.enum = value;
  });
}
