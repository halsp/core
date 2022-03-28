import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { SfaHeader } from "../context/sfa-header";
import { isObject, isString } from "../utils";
import { Dict } from "../utils/types";
import { HttpExceptionHeader } from "./http-exception-header";

export class HttpException extends Error {
  constructor(
    public readonly status: StatusCodes,
    public readonly error?: string | Dict
  ) {
    super();
    this.name = this.constructor.name;
    this.initMessage();
  }

  #breakthrough = false;
  public get breakthrough(): boolean {
    return this.#breakthrough;
  }
  public setBreakthrough(breakthrough = true): this {
    this.#breakthrough = breakthrough;
    return this;
  }

  #header = new HttpExceptionHeader();
  public get header() {
    return this.#header;
  }
  public setHeaders(funcs: (header: SfaHeader) => void): this {
    funcs(this.#header);
    return this;
  }

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
