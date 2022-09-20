import { Context, Startup } from "@ipare/core";

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

  async run(): Promise<Context> {
    const ctx = await super.invoke(this.#ctx ?? new Context());

    if (!this.#skipThrow && ctx.errorStack.length) {
      throw ctx.errorStack[0];
    }
    return ctx;
  }

  it(
    name: string,
    fn?: (res: Context) => void | Promise<void>,
    timeout?: number
  ): void {
    it(
      name,
      async () => {
        const ctx = await this.run();
        if (fn) await fn(ctx);
      },
      timeout
    );
  }
}
