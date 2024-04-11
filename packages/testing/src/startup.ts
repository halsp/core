import { Context, HookType, Request, Response, Startup } from "@halsp/core";
import type supertest from "supertest";

declare module "@halsp/core" {
  interface Startup {
    keepThrow(): this;
    setContext(ctx: Context | Request): this;
    test(): Promise<Response>;
    nativeTest(): supertest.SuperTest<supertest.Test>;
    expect(expect: (res: Response) => void): this;
    expectError(expect: (err?: any) => void): this;
  }
}

const errorMap = new WeakMap<Context, Error[]>();
function getError(ctx: Context) {
  const errs = errorMap.get(ctx);
  if (errs?.length) {
    return errs[0];
  }
}

const ctxMap = new WeakMap<Startup, Context | Request>();
const initMap = new WeakMap<Startup, boolean>();
Startup.prototype.test = async function (): Promise<Response> {
  process.env.NODE_ENV = "test";

  if (!initMap.has(this)) {
    initMap.set(this, true);
    await this["initialize"]();
  }
  const res = await this["invoke"](ctxMap.get(this) ?? new Context());

  const err = getError(res.ctx);
  if (err) throw err;

  return res;
};

Startup.prototype.keepThrow = function () {
  return this.use(async (ctx, next) => {
    if (nativeTestMap.get(this)) {
      initSupertest(ctx);
    }

    errorMap.set(ctx, []);
    await next();
  }).hook(HookType.Unhandled, (ctx, md, err) => {
    const errs = errorMap.get(ctx) as any[];
    errs.push(err);
  });
};

Startup.prototype.expectError = function (expect: (err?: any) => void) {
  return this.use(async (ctx, next) => {
    await next();

    const err = getError(ctx);
    expect(err);
    const errs = errorMap.get(ctx);
    if (err && errs) {
      errs.splice(errs.indexOf(err), 1);
    }
  });
};

Startup.prototype.expect = function (expect: (res: Response) => void) {
  return this.use(async (ctx, next) => {
    await next();

    expect(ctx.res);
  });
};

Startup.prototype.setContext = function (ctx: Context | Request): Startup {
  ctxMap.set(this, ctx);
  return this;
};

const nativeTestMap = new WeakMap<Startup, boolean>();
Startup.prototype.nativeTest = function () {
  nativeTestMap.set(this, true);

  const supertest = _require("supertest");
  return supertest(this["nativeServer"]);
};

function initSupertest(ctx: Context) {
  const supertest = _require("supertest");
  const { Test } = supertest;

  if (!Test.prototype._beforeCallback) {
    Test.prototype._beforeCallback = Test.prototype.callback;
  }
  Test.prototype.callback = function (err: any, res: any) {
    if (this.constructor == Test && !err) {
      const stackErr = getError(ctx);
      if (stackErr) {
        err = stackErr;
      }
    }

    return Test.prototype._beforeCallback.bind(this)(
      err,
      err ? undefined : res,
    );
  };
}
