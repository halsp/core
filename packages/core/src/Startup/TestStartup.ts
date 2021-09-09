import Startup from ".";
import HttpContext from "../HttpContext";
import Response from "../Response";
import SfaRequest from "../SfaRequest";

export default class TestStartup extends Startup {
  #req?: SfaRequest;
  constructor(req?: SfaRequest) {
    super();
    this.#req = req;
  }

  async run(req?: SfaRequest): Promise<Response> {
    return await super.invoke(
      new HttpContext(req ?? this.#req ?? new SfaRequest())
    );
  }
}
