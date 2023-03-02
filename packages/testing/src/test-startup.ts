import { Context, Request, Response, Startup } from "@halsp/core";

export interface ITestStartup extends Startup {
  skipThrow?: boolean;
  ctx?: Context | Request;
  setContext(ctx: Context | Request): this;
  setSkipThrow(val?: boolean): this;
  run(): Promise<Response>;
  expect(fn: (res: Response) => void | Promise<void>): Promise<void>;
}

export class TestStartup extends Startup {
  constructor() {
    super();
    initBaseTestStartup(this);
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestStartup extends ITestStartup {}

export function initBaseTestStartup<T extends ITestStartup>(startup: T): T {
  process.env.NODE_ENV = "test";
  startup.skipThrow = undefined;
  startup.ctx = undefined;
  startup.setSkipThrow = function (val = true): T {
    this.skipThrow = val;
    return this;
  };
  startup.setContext = function (ctx: Context | Request): T {
    this.ctx = ctx;
    return this;
  };

  startup.run = async function (): Promise<Response> {
    const res = await this["invoke"](this.ctx ?? new Context());
    if (!this.skipThrow && res.ctx.errorStack.length) {
      throw res.ctx.errorStack[0];
    }
    return res;
  };
  startup.expect = async function (
    fn: (res: Response) => void | Promise<void>
  ) {
    const res = await this.run();
    fn(res);
  };

  return startup;
}
