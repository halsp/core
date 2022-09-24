import { Dict, Context } from "@ipare/core";

export type PipeReqType = "query" | "param" | "header" | "body" | "payload";

export function getReqHandler(type: PipeReqType): (ctx: Context) => Dict {
  switch (type) {
    case "header":
      return (ctx) => (ctx as any).req.headers;
    case "query":
      return (ctx) => (ctx as any).req.query;
    case "param":
      return (ctx) => (ctx as any).req.params ?? (ctx as any).req.param;
    case "payload":
      return (ctx) => (ctx as any).payload;
    default:
      return (ctx) => (ctx as any).req.body;
  }
}
