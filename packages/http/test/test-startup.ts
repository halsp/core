import { HttpStartup, Request, Response } from "../src";

export class TestStartup extends HttpStartup {
  readonly #req?: Request;
  constructor(req?: Request) {
    super();
    this.#req = req;
  }

  async run(): Promise<Response> {
    return await super.invoke(this.#req ?? new Request());
  }
}
