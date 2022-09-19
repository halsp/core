import { ServerStartup } from "@ipare/server";
import supertest from "supertest";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Test } = require("supertest");

export class TestHttpStartup extends ServerStartup {
  #skipThrow?: boolean;
  #errorStack?: Error[];

  constructor() {
    super();

    this.use(async (ctx, next) => {
      await next();

      if (!this.#skipThrow && ctx.errorStack.length) {
        this.#errorStack = ctx.errorStack;
      }
    });
  }

  skipThrow(): this {
    this.#skipThrow = true;
    return this;
  }

  create(): supertest.SuperTest<supertest.Test> {
    const test = supertest(this.server);

    const getError = () => {
      if (!this.#skipThrow && this.#errorStack) {
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
      return callback.bind(this)(err, res);
    };
    return test;
  }
}
