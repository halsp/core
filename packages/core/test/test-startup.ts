import { Startup } from "../src/startup";
import { Context, Request, Response } from "../src/context";

export class TestStartup extends Startup {
  readonly #req?: Request;
  constructor(req?: Request) {
    super();
    this.#req = req;
  }

  async run(): Promise<Response> {
    const ctx = new Context(this.#req ?? new Request());
    return await super.invoke(ctx);
  }
}
