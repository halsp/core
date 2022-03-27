import { SfaHeader } from "../context/SfaHeader";
import { HeadersDict } from "../types";

export class HttpExceptionHeader extends SfaHeader {
  constructor() {
    super(() => this.#headers);
  }

  #headers: HeadersDict = {};
  public get headers(): HeadersDict {
    return this.#headers;
  }
}
