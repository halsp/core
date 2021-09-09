import HttpContext from "./HttpContext";
import SfaRequest from "./SfaRequest";
import SfaResponse from "./SfaResponse";
import Startup from "./Startup";

export default class TestStartup extends Startup {
  #req?: SfaRequest;
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
