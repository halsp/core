import SfaRequest from "./SfaRequest";
import Response from "./Response";
import ResultHandler from "./ResultHandler";

export default class HttpContext extends ResultHandler {
  constructor(req: SfaRequest) {
    super(() => this.#res);
    this.#req = req;
  }

  readonly #bag: { [k: string]: unknown } = {};

  #res: Response = new Response();
  public get res(): Response {
    return this.#res;
  }

  #req: SfaRequest;
  public get req(): SfaRequest {
    return this.#req;
  }

  public bag<T>(key: string): T;
  public bag<T>(key: string, value: T): this;
  public bag<T>(key: string, builder: () => T): this;
  public bag<T>(key: string, value?: T | (() => T)): this | T {
    if (value == undefined) {
      const result = this.#bag[key];
      if (typeof result == "function") {
        return result();
      } else {
        return result as T;
      }
    } else {
      this.#bag[key] = value;
      return this;
    }
  }
}
