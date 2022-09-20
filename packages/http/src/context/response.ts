import { StatusCodes } from "http-status-codes";
import { HeadersDict, ReadonlyHeadersDict } from "../types";
import { Context } from "@ipare/core";
import { ResultHandler } from "./result-handler";

export class Response extends ResultHandler {
  constructor() {
    super(() => this);
  }

  public readonly ctx!: Context;

  readonly #headers: HeadersDict = {};

  get isSuccess(): boolean {
    return this.status >= 200 && this.status < 300;
  }

  get headers(): ReadonlyHeadersDict {
    return this.#headers;
  }

  public body: any;
  setBody(body: unknown): this {
    this.body = body;
    return this;
  }

  public status = StatusCodes.NOT_FOUND;
  setStatus(status: StatusCodes): this {
    this.status = status;
    return this;
  }
}
