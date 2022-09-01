import { ObjectConstructor } from "@ipare/core";
import { V, ValidatorDecoratorReturnType } from "@ipare/validator";
import {
  CallbacksObject,
  DiscriminatorObject,
  ExampleObject,
  ExternalDocumentationObject,
  ParameterStyle,
  ResponsesObject,
  SchemaObject,
  SecurityRequirementObject,
  ServerObject,
  XmlObject,
} from "openapi3-ts";

type RT = ValidatorDecoratorReturnType;

declare module "@ipare/validator" {
  interface ValidatorLib {
    Ignore: () => RT;

    Tags: (...value: string[]) => RT;
    Summary: (value: string) => RT;
    Description: (value: string) => RT;
    ExternalDocs: (value: ExternalDocumentationObject) => RT;
    Deprecated: () => RT;
    Servers: (...value: ServerObject[]) => RT;
    Security: (...value: SecurityRequirementObject[]) => RT;
    Callbacks: (value: CallbacksObject) => RT;
    Responses: (value: ResponsesObject) => RT;
    OperationId: (value: string) => RT;

    Style: (value: ParameterStyle) => RT;
    Explode: () => RT;
    AllowReserved: () => RT;
    Examples: (value: Record<string, ExampleObject>) => RT;
    Example: (value: any) => RT;
    // Content: (value: ContentObject) => RT;

    Discriminator: (value: DiscriminatorObject) => RT;
    ReadOnly: () => RT;
    WriteOnly: () => RT;
    Xml: (value: XmlObject) => RT;
    Type: (
      value:
        | "integer"
        | "number"
        | "string"
        | "boolean"
        | "object"
        | "null"
        | "array"
    ) => RT;
    Format: (
      value:
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
    ) => RT;
    Items: (value: ObjectConstructor | SchemaObject) => RT;
    Default: (value: any) => RT;
    Title: (value: string) => RT;
    MaxProperties: (value: number) => RT;
    MinProperties: (value: number) => RT;
    Enum: (...value: any[]) => RT;

    MediaTypes: (...value: string[]) => RT;
  }
}

export const S = V;
