import { StatusCodes } from "http-status-codes";
import { Response } from "@halsp/common";
import { initResultHandler, ResultHandler } from "./result-handler";
import { HeaderHandler, initHeaderHandler } from "./header-handler";
import {
  HeadersDict,
  NumericalHeadersDict,
  ReadonlyHeadersDict,
} from "../types";
import { HttpRequest } from "./request";

export class HttpResponse extends Response<HttpRequest> {
  constructor(
    public status: StatusCodes = StatusCodes.NOT_FOUND,
    public body: any = undefined,
    headers?: NumericalHeadersDict
  ) {
    super();

    initResultHandler(this, function () {
      return this;
    });
    initHeaderHandler(
      this,
      function () {
        return this.headers;
      },
      function () {
        return this.headers;
      }
    );

    if (headers) this.setHeaders(headers);
  }

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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HttpResponse extends ResultHandler, HeaderHandler {}
