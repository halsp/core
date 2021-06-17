import { StatusCodes } from "http-status-codes";
import HttpContext from "../HttpContext";

export default class ResponseError extends Error {
  public readonly headers = <Record<string, string | string[] | undefined>>{};
  public body?: unknown;
  public status?: StatusCodes;

  constructor(message?: string) {
    super(message);
  }

  public setBody(body: unknown): ResponseError {
    this.body = body;
    return this;
  }

  public setStatus(status: StatusCodes): ResponseError {
    this.status = status;
    return this;
  }

  setHeaders(
    headers: Record<string, string | string[] | undefined>
  ): ResponseError {
    Object.assign(this.headers, headers);
    return this;
  }

  setHeader(key: string, value?: string | string[]): ResponseError {
    this.headers[key] = value;
    return this;
  }

  writeToCtx(ctx: HttpContext): ResponseError {
    if (this.status != undefined) {
      ctx.res.status = this.status;
    }
    if (this.body != undefined) {
      ctx.res.body = this.body;
    }
    ctx.res.setHeaders(this.headers);
    return this;
  }
}
