import SfaRequest from "./SfaRequest";
import SfaResponse from "./SfaResponse";
import ResultHandler from "./ResultHandler";

export default class HttpContext extends ResultHandler {
  constructor(req: SfaRequest) {
    super(() => this.#res);
    this.#req = req;
  }

  readonly #bag: { [k: string]: unknown } = {};

  #res: SfaResponse = new SfaResponse();
  public get res(): SfaResponse {
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
