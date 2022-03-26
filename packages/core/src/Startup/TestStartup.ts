import HttpContext from "../Context/HttpContext";
import SfaRequest from "../Context/SfaRequest";
import SfaResponse from "../Context/SfaResponse";
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
