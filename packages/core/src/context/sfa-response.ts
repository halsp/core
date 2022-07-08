import { StatusCodes } from "http-status-codes";
import {
  HeadersDict,
  NumericalHeadersDict,
  ReadonlyHeadersDict,
} from "../utils";
import { HttpContext } from "./http-context";
import { ResultHandler } from "./result-handler";

export class Response extends ResultHandler {
  constructor(
    public status: StatusCodes = StatusCodes.NOT_FOUND,
    public body: any = undefined,
    headers?: NumericalHeadersDict
  ) {
    super(() => this);
    if (headers) this.setHeaders(headers);
  }

  public readonly ctx!: HttpContext;

  readonly #headers: HeadersDict = {};

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
