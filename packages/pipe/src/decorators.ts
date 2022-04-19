import "reflect-metadata";
import { CreateInject } from "@sfajs/inject";
import { Dict, HttpContext } from "@sfajs/core";

function getReqInject(handler: (ctx: HttpContext) => Dict, property?: string) {
  return CreateInject((ctx) => {
    const dict = handler(ctx);
    if (!property) {
      return dict;
    }
    if (!dict) {
      return undefined;
    }
    return dict[property];
  });
}

export const Query = (property?: string) =>
  getReqInject((ctx) => ctx.req.query, property);
export const Body = (property?: string) =>
  getReqInject((ctx) => ctx.req.body, property);
export const Param = (property?: string) =>
  getReqInject(
    (ctx) => (ctx.req as any).params ?? (ctx.req as any).param,
    property
  );
export const Header = (property?: string) =>
  getReqInject((ctx) => ctx.req.headers, property);

export const Ctx = CreateInject((ctx) => ctx);
