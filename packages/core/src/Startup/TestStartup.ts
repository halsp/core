import HttpContext from "../conext/HttpContext";
import SfaRequest from "../conext/SfaRequest";
import SfaResponse from "../conext/SfaResponse";
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
