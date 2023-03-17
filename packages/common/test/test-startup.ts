import { Context, Request, Response, Startup } from "../src";

export class TestStartup<
  TReq extends Request = Request,
  TRes extends Response = Response,
  TC extends Context<TReq, TRes> = Context<TReq, TRes>
> extends Startup<TReq, TRes, TC> {
  async run() {
    return await this.invoke();
  }

  protected async invoke(ctx?: TReq | TC): Promise<TRes> {
    return await super.invoke(ctx);
  }
}
