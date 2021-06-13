import Startup from ".";
import HttpContext from "../HttpContext";
import Response from "../Response";
import Request from "../Request";

export default class SimpleStartup extends Startup {
  #req?: Request;
  constructor(req?: Request) {
    super();
    this.#req = req;
  }

  async run(req?: Request): Promise<Response> {
    return await super.invoke(
      new HttpContext(req ?? this.#req ?? new Request())
    );
  }
}
