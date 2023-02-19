import { Context, Request, Response } from "./context";
import * as honion from "honion";

export abstract class Startup<
  TC extends Context = Context
> extends honion.Honion<TC> {
  constructor() {
    super();
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "production";
    }
  }

  protected async invoke(ctx: Request | TC): Promise<Response> {
    ctx = ctx instanceof Context ? ctx : (new Context(ctx) as TC);
    await super.invoke(ctx);
    return ctx.res;
  }
}
