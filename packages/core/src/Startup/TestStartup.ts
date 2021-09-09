import Startup from ".";
import HttpContext from "../HttpContext";
import SfaResponse from "../SfaResponse";
import SfaRequest from "../SfaRequest";

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
