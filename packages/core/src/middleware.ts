import * as honion from "honion";
import { Context } from "./context";

export abstract class Middleware extends honion.Middleware<Context> {
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
export class ComposeMiddleware extends honion.ComposeMiddleware<Context> {}
