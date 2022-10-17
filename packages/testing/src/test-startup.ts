import { Context, Response, Startup } from "@ipare/core";

export class TestStartup extends Startup {
  #skipThrow?: boolean;
  #ctx?: Context;

  setContext(ctx: Context): this {
    this.#ctx = ctx;
    return this;
  }

  skipThrow(): this {
    this.#skipThrow = true;
    return this;
  }

  async run(): Promise<Response> {
    const res = await super.invoke(this.#ctx ?? new Context());
    const ctx = res.ctx;

    if (!this.#skipThrow && ctx.errorStack.length) {
      throw ctx.errorStack[0];
    }
    return res;
  }

  it(
    name: string,
    fn?: (res: Response) => void | Promise<void>,
    timeout?: number
  ): void {
    it(
      name,
      async () => {
        const res = await this.run();
        if (fn) await fn(res);
      },
      timeout
    );
  }
}
