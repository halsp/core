import { StatusCodes } from "http-status-codes";
import ResultHandler from "../ResultHandler";
import { HeadersDict, ReadonlyHeadersDict } from "../types";

export default class Response extends ResultHandler {
  #headers: HeadersDict = {};

  constructor(
    public status: StatusCodes = StatusCodes.NOT_FOUND,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public body: any = undefined,
    headers = {}
  ) {
    super(() => this);
    this.setHeaders(headers);
    this.setHeader("sfa", "https://github.com/sfajs/sfa");
  }

  get isSuccess(): boolean {
    return this.status >= 200 && this.status < 300;
  }

  get headers(): ReadonlyHeadersDict {
    return this.#headers;
  }
}
