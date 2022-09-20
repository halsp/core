import { Context } from "@ipare/core";
import { Request } from "./request";
import { Response } from "./response";

export * from "./response";
export * from "./request";
export * from "./result-handler";
export * from "./header-handler";

export function createContext(req?: Request) {
  const ctx = new Context();
  const res = new Response();
  req = req ?? new Request();

  Object.defineProperty(ctx, "req", {
    get: () => req,
  });
  Object.defineProperty(ctx, "res", {
    get: () => res,
  });
  Object.defineProperty(ctx.req, "ctx", {
    get: () => ctx,
  });
  Object.defineProperty(ctx.res, "ctx", {
    get: () => ctx,
  });
  return ctx;
}
