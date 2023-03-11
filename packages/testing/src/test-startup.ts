import { Context, Request, Response, Startup } from "@halsp/common";

export interface ITestStartup<
  TReq extends Request,
  TRes extends Response,
  TC extends Context<TReq, TRes>
> extends Startup<TReq, TRes, TC> {
  skipThrow?: boolean;
  ctx?: TC | TReq;
  setContext(ctx: TC | TReq): this;
  setSkipThrow(val?: boolean): this;
  run(): Promise<TRes>;
  expect(fn: (res: TRes) => void | Promise<void>): Promise<void>;
}

export class TestStartup<
  TReq extends Request = Request,
  TRes extends Response = Response,
  TC extends Context<TReq, TRes> = Context<TReq, TRes>
> extends Startup<TReq, TRes, TC> {
  constructor() {
    super();
    initBaseTestStartup(this);
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestStartup<
  TReq extends Request = Request,
  TRes extends Response = Response,
  TC extends Context<TReq, TRes> = Context<TReq, TRes>
> extends ITestStartup<TReq, TRes, TC> {}

export function initBaseTestStartup<
  TReq extends Request,
  TRes extends Response,
  TC extends Context<TReq, TRes>,
  T extends ITestStartup<TReq, TRes, TC>
>(startup: T): T {
  process.env.NODE_ENV = "test";
  startup.skipThrow = undefined;
  startup.ctx = undefined;
  startup.setSkipThrow = function (val = true): T {
    this.skipThrow = val;
    return this;
  };
  startup.setContext = function (ctx: TC | TReq): T {
    this.ctx = ctx;
    return this;
  };

  startup.run = async function (): Promise<TRes> {
    const res = await this["invoke"](this.ctx ?? (new Context() as TC));
    if (!this.skipThrow && res.ctx.errorStack.length) {
      throw res.ctx.errorStack[0];
    }
    return res as TRes;
  };
  startup.expect = async function (fn: (res: TRes) => void | Promise<void>) {
    const res = await this.run();
    fn(res);
  };

  return startup;
}
