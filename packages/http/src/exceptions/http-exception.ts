import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { HeaderHandler, initHeaderHandler } from "../context/header-handler";
import { Dict, isObject, isString } from "@ipare/core";
import { HeadersDict } from "../types";

export class HttpException extends Error {
  constructor(
    public readonly status: StatusCodes,
    public readonly error?: string | Dict
  ) {
    super();
    this.name = this.constructor.name;
    this.#initMessage();
    initHeaderHandler(
      this,
      () => this.headers,
      () => this.headers
    );
  }

  #breakthrough = false;
  public get breakthrough(): boolean {
    return this.#breakthrough;
  }
  public setBreakthrough(breakthrough = true): this {
    this.#breakthrough = breakthrough;
    return this;
  }

  readonly #headers: HeadersDict = {};
  public get headers(): HeadersDict {
    return this.#headers;
  }

  #initMessage() {
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HttpException extends HeaderHandler {}
