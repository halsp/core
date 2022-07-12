import { HeadersDict } from "@ipare/core";

export interface ResponseStruct {
  readonly isBase64Encoded: boolean;
  readonly statusCode: number;
  readonly status: number;
  readonly headers: HeadersDict;
  readonly body: any;
}
