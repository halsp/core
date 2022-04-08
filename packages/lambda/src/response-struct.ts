import { HeadersDict } from "@sfajs/core";

export interface ResponseStruct {
  isBase64Encoded: boolean;
  statusCode: number;
  headers: HeadersDict;
  body: any;
}
