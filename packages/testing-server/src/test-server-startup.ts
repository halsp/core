import { ITestStartup, initBaseTestStartup } from "@ipare/testing";
import { ServerStartup } from "@ipare/server";
import supertest from "supertest";
import { Context, Request, Response } from "@ipare/core";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Test } = require("supertest");

export class TestServerStartup extends ServerStartup {
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

  protected async invoke(ctx: Request | Context): Promise<Response> {
    return await super.invoke(ctx);
  }

  create(): supertest.SuperTest<supertest.Test> {
    const test = supertest(this.server);

    const getError = () => {
      if (!this.skipThrow && this.#errorStack) {
        return this.#errorStack[0];
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
    return test;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestServerStartup extends ITestStartup {}
