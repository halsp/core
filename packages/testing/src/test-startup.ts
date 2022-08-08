import { HookType, HttpContext, Startup, Request, Response } from "@ipare/core";

export interface TestStartupOptions {
  req?: Request;
  hookException?: boolean;
}

export class TestStartup extends Startup {
  #err?: Error;

  constructor(private readonly options: TestStartupOptions = {}) {
    super();

    if (options.hookException ?? true) {
      this.hook(HookType.Exception, (ctx, md, ex) => {
        this.#err = ex;
        return true;
      });
    }
  }

  async run(): Promise<Response> {
    const res = await super.invoke(
      new HttpContext(this.options.req ?? new Request())
    );

    if (this.#err) {
      throw this.#err;
    }
    return res;
  }
}
