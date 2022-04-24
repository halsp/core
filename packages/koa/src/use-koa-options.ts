import { HttpContext } from "@sfajs/core";

export interface UseKoaOptions {
  streamingBody?: (ctx: HttpContext) => NodeJS.ReadableStream;
}
