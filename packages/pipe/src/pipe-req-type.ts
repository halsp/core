import { Dict, HttpContext } from "@sfajs/core";

export type PipeReqType = "query" | "param" | "header" | "body";

export function getReqHandler(type: PipeReqType): (ctx: HttpContext) => Dict {
  switch (type) {
    case "header":
      return (ctx) => ctx.req.headers;
    case "query":
      return (ctx) => ctx.req.query;
    case "param":
      return (ctx) => (ctx.req as any).params ?? (ctx.req as any).param;
    default:
      return (ctx) => ctx.req.body;
  }
}
