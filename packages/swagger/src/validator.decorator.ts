import { ValidatorDecoratorReturnType } from "@ipare/validator";
import {
  DiscriminatorObject,
  ExampleObject,
  ExternalDocumentationObject,
  HeaderObject,
  ParameterStyle,
  SecurityRequirementObject,
  ServerObject,
  XmlObject,
} from "openapi3-ts";
import { ArrayItemType } from "./parser/schema-dict";

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
    Format: ((
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
    ) => RT) &
      ((value: string) => RT);
    Items: (type: ArrayItemType) => RT;
    Default: (value: any) => RT;
    Title: (value: string) => RT;
    MaxProperties: (value: number) => RT;
    MinProperties: (value: number) => RT;
    Enum: (...value: any[]) => RT;

    ContentTypes: (...value: string[]) => RT;

    Response: ((body: ArrayItemType) => RT) &
      ((status: number, body: ArrayItemType) => RT);
    ResponseHeaders: ((headers: Record<string, HeaderObject>) => RT) &
      ((status: number, value: Record<string, HeaderObject>) => RT);
    ResponseDescription: ((description: string) => RT) &
      ((status: number, description: string) => RT);
    ResponseContentTypes: (...value: string[]) => RT;
  }
}

export {};
