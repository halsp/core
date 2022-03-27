import { HttpContext } from "../context/HttpContext";
import { SfaRequest } from "../context/SfaRequest";
import { SfaResponse } from "../context/SfaResponse";
import { Startup } from "./Startup";

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
