import { isClass, isUndefined, ObjectConstructor } from "@sfajs/core";
import { PipeReqType } from "@sfajs/pipe";
import {
  ExampleObject,
  OpenApiBuilder,
  OperationObject,
  ParameterObject,
  ParameterStyle,
  SchemaObject,
  XmlObject,
} from "openapi3-ts";
import { IGNORE, PIPE_DECORATORS } from "../constant";
import { pipeTypeToDocType, typeToApiType } from "../parser/utils/doc-types";
import { ensureModelSchema } from "../parser/utils/model-schema";

export type DecoratorFn = (args: {
  pipeType: PipeReqType;
  schema: SchemaObject | OperationObject;
  builder: OpenApiBuilder;
}) => void;

type SetSchemaValueDecoratorFn = (args: {
  pipeType: PipeReqType;
  schema: SchemaObject | ParameterObject;
  builder: OpenApiBuilder;
}) => void;

type CreateDecoratorFn = (args: {
  pipeType: PipeReqType;
  schema: SchemaObject | ParameterObject;
  target: any;
  propertyKey: string;
  builder: OpenApiBuilder;
}) => void;

function isSchemaObject(
  schema: SchemaObject | ParameterObject | OperationObject
): schema is SchemaObject {
  return isUndefined(schema.parameters) && isUndefined(schema.in);
}

function getParameterObject(
  propertyKey: string,
  pipeType: PipeReqType,
  schema: OperationObject
) {
  const parameters = schema.parameters as ParameterObject[];
  const existParameter = parameters.filter((p) => p.name == propertyKey)[0];
  const parameter = existParameter ?? {
    name: propertyKey,
    in: pipeTypeToDocType(pipeType),
    required: pipeType == "param",
  };
  if (!existParameter) {
    parameters.push(parameter);
  }
  return parameter;
}

function setValue(
  target: any,
  propertyKey: string,
  pipeType: PipeReqType,
  schema: SchemaObject | OperationObject,
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
        ensureModelSchema(builder, propertyCls, pipeType);
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
    dict = getParameterObject(propertyKey, pipeType, schema);
  }
  fn({
    pipeType,
    schema: dict,
    builder,
  });
}

function createPropertyDecorator(fn: CreateDecoratorFn) {
  return function (target: any, propertyKey: string) {
    const propertyDecs: DecoratorFn[] =
      Reflect.getMetadata(PIPE_DECORATORS, target) ?? [];
    propertyDecs.push(({ pipeType, schema, builder }) => {
      if (isSchemaObject(schema)) {
        fn({ pipeType, propertyKey, schema, target, builder });
      } else {
        fn({
          pipeType,
          propertyKey,
          schema: getParameterObject(propertyKey, pipeType, schema),
          target,
          builder,
        });
      }
    });
    Reflect.defineMetadata(PIPE_DECORATORS, propertyDecs, target);
  };
}

function createPropertySetValueDecorator(fn: SetSchemaValueDecoratorFn) {
  return function (target: any, propertyKey: string | symbol) {
    const propertyDecs: DecoratorFn[] =
      Reflect.getMetadata(PIPE_DECORATORS, target) ?? [];
    propertyDecs.push(({ pipeType, schema, builder }) =>
      setValue(target, propertyKey as string, pipeType, schema, builder, fn)
    );
    Reflect.defineMetadata(PIPE_DECORATORS, propertyDecs, target);
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
  return createPropertySetValueDecorator(({ schema }) => {
    schema[IGNORE] = true;
  });
}

export function PropertyParameterSchema(
  value: SchemaObject | ObjectConstructor
) {
  return createPropertySetValueDecorator(({ schema, builder, pipeType }) => {
    if (!isSchemaObject(schema)) {
      if (isClass(value)) {
        ensureModelSchema(builder, value, pipeType);
        schema.schema = {
          $ref: `#/components/schemas/${value.name}`,
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
    ({ target, propertyKey, schema, pipeType, builder }) => {
      if (isSchemaObject(schema)) {
        if (!schema.required) {
          schema.required = [];
        }
        schema.required.push(propertyKey);
        setValue(
          target,
          propertyKey,
          pipeType,
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
  return createPropertySetValueDecorator(({ schema, builder, pipeType }) => {
    if (isClass(value)) {
      ensureModelSchema(builder, value, pipeType);
      schema.items = {
        $ref: `#/components/schemas/${value.name}`,
      };
    } else {
      schema.items = value;
    }
  });
}

export function PropertyExample(example: any) {
  return createPropertySetValueDecorator(({ schema }) => {
    schema.example = example;
  });
}

export function PropertyExamples(examples: Record<string, ExampleObject>) {
  return createPropertySetValueDecorator(({ schema }) => {
    schema.examples = examples;
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
