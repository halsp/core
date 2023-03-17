import { MicroContext, MicroRequest, MicroStartup } from "../src";

export class TestStartup extends MicroStartup {
  readonly #req?: MicroRequest;
  constructor(req?: MicroRequest) {
    super();
    this.#req = req;
  }

  async run() {
    return await super.invoke(this.#req ?? new MicroContext());
  }
}
