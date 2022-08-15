import { HttpContext, Startup, Request, Response } from "@ipare/core";
import { TestStartupOptions } from "./options";

export class TestStartup extends Startup {
  #options: TestStartupOptions;

  constructor(req: Request);
  constructor(options?: TestStartupOptions);
  constructor(options: TestStartupOptions | Request = {}) {
    super();

    if (options instanceof Request) {
      options = {
        req: options,
      } as TestStartupOptions;
    }
    this.#options = options;
  }

  async run(): Promise<Response> {
    const res = await super.invoke(
      new HttpContext(this.#options.req ?? new Request())
    );

    if (!this.#options.skipThrow && res.ctx.errorStack.length) {
      throw res.ctx.errorStack[0];
    }
    return res;
  }
}
