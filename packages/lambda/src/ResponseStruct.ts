export default interface ResponseStruct {
  isBase64Encoded: boolean;
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
}
