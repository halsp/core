import { HttpContext, SfaRequest, SfaResponse, Startup } from "../src";

export class TestStartup extends Startup {
  readonly #req?: SfaRequest;
  constructor(req?: SfaRequest, root?: string) {
    super(root);
    this.#req = req;
  }

  async run(req?: SfaRequest): Promise<SfaResponse> {
    return await super.invoke(
      new HttpContext(req ?? this.#req ?? new SfaRequest())
    );
  }
}
