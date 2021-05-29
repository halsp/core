import StatusCode from "./StatusCode";

export default class ResponseError extends Error {
  public readonly headers = <Record<string, string>>{};
  public body?: unknown = {};
  public status?: StatusCode | number;

  constructor(message?: string) {
    super(message);
  }

  public setBody(body: unknown): ResponseError {
    this.body = body;
    return this;
  }

  public setStatus(status: StatusCode | number): ResponseError {
    this.status = status;
    return this;
  }

  public setHeaders(key: string, value: string): ResponseError {
    this.headers[key] = value;
    return this;
  }
}
