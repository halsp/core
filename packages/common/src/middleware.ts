import * as honion from "honion";
import { Context, Request, Response } from "./context";

export abstract class Middleware<
  TReq extends Request = Request,
  TRes extends Response = Response,
  TC extends Context<TReq, TRes> = Context<TReq, TRes>
> extends honion.Middleware<TC> {
  get req() {
    return this.ctx.req;
  }
  get request() {
    return this.req;
  }

  get res() {
    return this.ctx.res;
  }
  get response() {
    return this.res;
  }
}

export class ComposeMiddleware<
  TReq extends Request = Request,
  TRes extends Response = Response,
  TC extends Context<TReq, TRes> = Context<TReq, TRes>
> extends honion.ComposeMiddleware<TC> {
  get req() {
    return this.ctx.req;
  }
  get request() {
    return this.req;
  }

  get res() {
    return this.ctx.res;
  }
  get response() {
    return this.res;
  }
}
