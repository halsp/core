import { NativeStartup } from "@halsp/native";
import supertest from "supertest";
import { initBaseTestStartup, ITestStartup } from "../test-startup";
import { HttpContext, HttpRequest, HttpResponse } from "@halsp/http";

export class TestNativeStartup extends NativeStartup {
  #errorStack?: Error[];

  constructor() {
    super();
    initBaseTestStartup(this);

    this.use(async (ctx, next) => {
      await next();

      if (!this.skipThrow && ctx.errorStack.length) {
        this.#errorStack = ctx.errorStack;
      }
    });
  }

  protected async invoke(
    ctx: HttpRequest | HttpContext
  ): Promise<HttpResponse> {
    return await super.invoke(ctx);
  }

  create(): supertest.SuperTest<supertest.Test> {
    const test = supertest(this.server);

    const getError = () => {
      if (!this.skipThrow && this.#errorStack) {
        return this.#errorStack[0];
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Test } = require("supertest");
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
    return test;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestNativeStartup
  extends ITestStartup<HttpRequest, HttpResponse, HttpContext> {}
