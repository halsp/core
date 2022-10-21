import { Context, Request } from "@ipare/core";
import { MicroStartup } from "../src";

export class TestStartup extends MicroStartup {
  readonly #req?: Request;
  constructor(req?: Request) {
    super();
    this.#req = req;
  }

  async run() {
    return await super.invoke(this.#req ?? new Context());
  }
}
