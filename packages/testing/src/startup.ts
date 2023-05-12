import { Context, HookType, Request, Response, Startup } from "@halsp/core";
import type supertest from "supertest";

declare module "@halsp/core" {
  interface Startup {
    keepThrow(): this;
    ctx?: Context | Request;
    setContext(ctx: Context | Request): this;
    test(): Promise<Response>;
    nativeTest(): supertest.SuperTest<supertest.Test>;
    expect(fn: (res: Response) => void | Promise<void>): Promise<void>;
  }
}

const errorMap = new WeakMap<Startup, Error[]>();
function getError(startup: Startup) {
  const errorStack = errorMap.get(startup);
  if (errorStack?.length) {
    return errorStack[0];
  }
}
Startup.prototype.test = async function (): Promise<Response> {
  process.env.NODE_ENV = "test";

  const res = await this["invoke"](this.ctx ?? new Context());

  const err = getError(this);
  if (err) throw err;

  return res;
};

Startup.prototype.keepThrow = function () {
  return this.hook(HookType.Unhandled, (ctx, md, err) => {
    const errs = errorMap.get(this) ?? [];
    errs.push(err);
    errorMap.set(this, errs);
  });
};

Startup.prototype.setContext = function (ctx: Context | Request): Startup {
  this.ctx = ctx;
  return this;
};

Startup.prototype.expect = async function (
  fn: (res: Response) => void | Promise<void>
): Promise<void> {
  const res = await this.test();
  fn(res);
};

Startup.prototype.nativeTest = function () {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const supertest = require("supertest");
  const { Test } = supertest;

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const startup = this;
  const callback: any = Test.prototype.callback;
  Test.prototype.callback = function (err: any, res: any) {
    if (this.constructor == Test && !err) {
      const stackErr = getError(startup);
      if (stackErr) {
        err = stackErr;
      }
    }
    return callback.bind(this)(err, err ? undefined : res);
  };

  return supertest(this["server"]);
};
