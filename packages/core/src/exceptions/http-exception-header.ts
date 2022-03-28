import { SfaHeader } from "../context/sfa-header";
import { HeadersDict } from "../utils/types";

export class HttpExceptionHeader extends SfaHeader {
  constructor() {
    super(() => this.#headers);
  }

  readonly #headers: HeadersDict = {};
  public get headers(): HeadersDict {
    return this.#headers;
  }
}
