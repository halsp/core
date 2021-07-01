import { StatusCodes } from "http-status-codes";
import ResultHandler from "../ResultHandler";
import {
  HeadersDict,
  NumericalHeadersDict,
  ReadonlyHeadersDict,
} from "../utils";

export default class Response extends ResultHandler {
  #headers: HeadersDict = {};

  constructor(
    public status: StatusCodes = StatusCodes.NOT_FOUND,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public body: any = undefined,
    headers?: NumericalHeadersDict
  ) {
    super(() => this);
    if (headers) this.setHeaders(headers);
    this.setHeader("sfa", "https://github.com/sfajs/sfa");
  }

  get isSuccess(): boolean {
    return this.status >= 200 && this.status < 300;
  }

  get headers(): ReadonlyHeadersDict {
    return this.#headers;
  }

  setBody(body: unknown): this {
    this.body = body;
    return this;
  }

  setStatus(status: StatusCodes): this {
    this.status = status;
    return this;
  }
}
