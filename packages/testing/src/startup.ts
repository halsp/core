import { Context, Request, Response, Startup } from "@halsp/core";
import type supertest from "supertest";

declare module "@halsp/core" {
  interface Startup {
    skipThrow?: boolean;
    setSkipThrow(val?: boolean): this;
    ctx?: Context | Request;
    setContext(ctx: Context | Request): this;
    test(): Promise<Response>;
    useNativeTest(): this;
    nativeTest(): supertest.SuperTest<supertest.Test>;
    expect(fn: (res: Response) => void | Promise<void>): Promise<void>;
  }
}

Startup.prototype.test = async function (): Promise<Response> {
  process.env.NODE_ENV = "test";

  const res = await this["invoke"](this.ctx ?? new Context());
  if (!this.skipThrow && res.ctx.errorStack.length) {
    throw res.ctx.errorStack[0];
  }
  return res;
};

Startup.prototype.setSkipThrow = function (val = true): Startup {
  this.skipThrow = val;
  return this;
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

const errorMap = new WeakMap<Startup, Error[]>();
Startup.prototype.useNativeTest = function () {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const supertest = require("supertest");
  const { Test } = supertest;

  const getError = () => {
    const errorStack = errorMap.get(this);
    if (!this.skipThrow && errorStack?.length) {
      return errorStack[0];
    }
  };
  const callback: any = Test.prototype.callback;
  Test.prototype.callback = function (err: any, res: any) {
    if (this.constructor == Test && !err) {
      const stackErr = getError();
      if (stackErr) {
        err = stackErr;
      }
    }
    return callback.bind(this)(err, err ? undefined : res);
  };

  this["useNative"]();

  return this.use(async (ctx, next) => {
    await next();

    if (!this.skipThrow && ctx.errorStack.length) {
      errorMap.set(this, ctx.errorStack);
    }
  });
};

Startup.prototype.nativeTest = function () {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const supertest = require("supertest");
  return supertest(this["server"]);
};
