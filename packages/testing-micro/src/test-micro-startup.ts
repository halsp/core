import { MicroStartup } from "@ipare/micro";
import { Request, Response } from "@ipare/core";

export class TestMicroStartup extends MicroStartup {
  listen() {
    //
  }
  async close() {
    //
  }

  #skipThrow?: boolean;
  #req?: Request;

  setRequest(req: Request): this {
    this.#req = req;
    return this;
  }

  skipThrow(): this {
    this.#skipThrow = true;
    return this;
  }

  async run(): Promise<Response> {
    const res = await super.invoke(this.#req ?? new Request());

    if (!this.#skipThrow && res.ctx.errorStack.length) {
      throw res.ctx.errorStack[0];
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
