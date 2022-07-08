import { Startup } from "./startup";
import { HttpContext, Request, SfaResponse } from "../context";

export class TestStartup extends Startup {
  readonly #req?: Request;
  constructor(req?: Request) {
    super();
    this.#req = req;
  }

  async run(req?: Request): Promise<SfaResponse> {
    return await super.invoke(
      new HttpContext(req ?? this.#req ?? new Request())
    );
  }
}
