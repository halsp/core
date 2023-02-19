import * as honion from "honion";
import { Context } from "./context";

export abstract class Middleware<
  TC extends Context = Context
> extends honion.Middleware<TC> {
  get req() {
    return this.ctx.req;
  }
  get request() {
    return this.ctx.req;
  }
  get res() {
    return this.ctx.res;
  }
  get response() {
    return this.ctx.response;
  }
}
export class ComposeMiddleware<
  TC extends Context = Context
> extends honion.ComposeMiddleware<TC> {}
