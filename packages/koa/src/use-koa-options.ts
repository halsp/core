import { HttpContext } from "@ipare/core";

export interface UseKoaOptions {
  streamingBody?: (ctx: HttpContext) => NodeJS.ReadableStream;
}
