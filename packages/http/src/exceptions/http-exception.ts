import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { HeaderHandler, initHeaderHandler } from "../context/header-handler";
import { ExceptionMessage, HalspException, isString } from "@halsp/common";
import { HeadersDict } from "../types";

export class HttpException extends HalspException {
  constructor(
    public readonly status: StatusCodes,
    error?: string | ExceptionMessage
  ) {
    super(error);

    if (!this.message) {
      this.message = getReasonPhrase(status);
    }

    this.name = this.constructor.name;
    initHeaderHandler(
      this,
      () => this.headers,
      () => this.headers
    );
  }

  readonly #headers: HeadersDict = {};
  public get headers(): HeadersDict {
    return this.#headers;
  }

  public toPlainObject() {
    const obj = {
      status: this.status,
      message: this.message,
    };
    if (this.error && !isString(this.error)) {
      return Object.assign(obj, this.error);
    } else {
      return obj;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HttpException extends HeaderHandler {}
