import { HookType, HttpContext, Startup, Request, Response } from "@ipare/core";

declare module "@ipare/core" {
  interface Response {
    get testError(): Error | undefined;
  }
}

export interface TestStartupOptions {
  req?: Request;
  skipThrow?: boolean;
}

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

    this.hook(HookType.Exception, (ctx, md, ex) => {
      Object.defineProperty(ctx.res, "testError", {
        configurable: false,
        enumerable: false,
        get: () => {
          return ex;
        },
      });
      return false;
    });
  }

  async run(): Promise<Response> {
    const res = await super.invoke(
      new HttpContext(this.#options.req ?? new Request())
    );

    if (!this.#options.skipThrow && res.testError) {
      throw res.testError;
    }
    return res;
  }
}
