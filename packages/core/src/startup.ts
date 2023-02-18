import { Context, Request, Response } from "./context";
import * as honion from "honion";

export abstract class Startup extends honion.Honion<Context> {
  constructor() {
    super();
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "production";
    }
  }

  protected async invoke(ctx: Request | Context): Promise<Response> {
    ctx = ctx instanceof Context ? ctx : new Context(ctx);
    await super.invoke(ctx);
    return ctx.res;
  }
}
