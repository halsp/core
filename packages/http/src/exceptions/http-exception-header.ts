import { HeaderHandler } from "../context/header-handler";
import { HeadersDict } from "../types";

export class HttpExceptionHeader extends HeaderHandler {
  constructor() {
    super(() => this.#headers);
  }

  readonly #headers: HeadersDict = {};
  public get headers(): HeadersDict {
    return this.#headers;
  }
}
