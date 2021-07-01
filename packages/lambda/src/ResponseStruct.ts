import { SfaUtils } from "sfa";

export default interface ResponseStruct {
  isBase64Encoded: boolean;
  statusCode: number;
  headers: SfaUtils.HeadersDict;
  body: unknown;
}
