import { HttpContext, HttpRequest, HttpResponse, HttpStartup } from "../src";

export class TestStartup extends HttpStartup {
  readonly #req?: HttpRequest;
  constructor(req?: HttpRequest) {
    super();
    this.#req = req;
  }

  async run(): Promise<HttpResponse> {
    return await super.invoke(this.#req ?? new HttpContext());
  }
}
