import { ObjectConstructor } from "@ipare/core";
import { V, ValidatorDecoratorReturnType } from "@ipare/validator";
import {
  DiscriminatorObject,
  ExampleObject,
  ExternalDocumentationObject,
  HeaderObject,
  ParameterStyle,
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

    Response: ((body: ObjectConstructor | SchemaObject) => RT) &
      ((status: number, body: ObjectConstructor | SchemaObject) => RT);
    ResponseHeaders: ((headers: Record<string, HeaderObject>) => RT) &
      ((status: number, value: Record<string, HeaderObject>) => RT);
    ResponseDescription: ((description: string) => RT) &
      ((status: number, description: string) => RT);
    ResponseMediaTypes: (...value: string[]) => RT;
  }
}

export const S = V;
