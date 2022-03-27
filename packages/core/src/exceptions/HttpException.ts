import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { HttpContext } from "../context/HttpContext";
import { isObject, isString } from "../shared";
import { Dict, HeadersDict } from "../types";

export class HttpException extends Error {
  constructor(
    public readonly status: StatusCodes,
    public readonly error?: string | Dict
  ) {
    super();
    this.name = this.constructor.name;
    this.initMessage();
  }

  public readonly headers: HeadersDict = {};

  private initMessage() {
    if (!this.error) {
      this.message = getReasonPhrase(this.status);
    } else if (isString(this.error)) {
      this.message = this.error;
    } else if (isObject(this.error) && isString(this.error["message"])) {
      this.message = this.error["message"];
    } else {
      this.message = getReasonPhrase(this.status);
    }
  }

  private toPlainObject() {
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

  public export(ctx: HttpContext): this {
    ctx
      .setHeaders(this.headers)
      .res.setStatus(this.status)
      .setBody(this.toPlainObject());
    return this;
  }
}
