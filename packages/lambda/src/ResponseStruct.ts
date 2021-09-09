import { HeadersDict } from "@sfajs/header";

export default interface ResponseStruct {
  isBase64Encoded: boolean;
  statusCode: number;
  headers: HeadersDict;
  body: unknown;
}
