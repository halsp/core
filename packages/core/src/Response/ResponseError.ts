import { StatusCodes } from "http-status-codes";

export default class ResponseError extends Error {
  public readonly headers = <Record<string, string | string[] | undefined>>{};
  public body?: unknown = {};
  public status?: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR;

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
}
