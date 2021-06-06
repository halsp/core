import { StatusCodes } from "http-status-codes";

export default class ResponseError extends Error {
  public readonly headers = <Record<string, string>>{};
  public body?: unknown = {};
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

  public setHeaders(key: string, value: string): ResponseError {
    this.headers[key] = value;
    return this;
  }
}
