import { HttpContext, SfaRequest, SfaResponse } from "../context";
import { Startup } from "./startup";

export class TestStartup extends Startup {
  readonly #req?: SfaRequest;
  constructor(req?: SfaRequest) {
    super();
    this.#req = req;
  }

  async run(req?: SfaRequest): Promise<SfaResponse> {
    return await super.invoke(
      new HttpContext(req ?? this.#req ?? new SfaRequest())
    );
  }
}
