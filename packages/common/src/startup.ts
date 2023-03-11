import { Context, Request, Response } from "./context";
import * as honion from "honion";

export abstract class Startup<
  TReq extends Request = Request,
  TRes extends Response = Response,
  TC extends Context<TReq, TRes> = Context<TReq, TRes>
> extends honion.Honion<TC> {
  constructor() {
    super();
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "production";
    }
  }

  protected async invoke(ctx: TReq | TC): Promise<TRes> {
    ctx = ctx instanceof Context ? ctx : (new Context(ctx) as TC);
    await super.invoke(ctx);
    return ctx.res;
  }
}
