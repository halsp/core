import { HeadersDict } from "@sfajs/core";

export default interface ResponseStruct {
  isBase64Encoded: boolean;
  statusCode: number;
  headers: HeadersDict;
  body: unknown;
}
