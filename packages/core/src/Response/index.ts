import { StatusCodes } from "http-status-codes";

export default class Response {
  constructor(
    public status: StatusCodes = StatusCodes.NOT_FOUND,
    public body: unknown = undefined,
    public readonly headers = <Record<string, string | string[] | undefined>>{
      sfa: "https://github.com/sfajs/sfa",
    }
  ) {}

  get isSuccess(): boolean {
    return this.status >= 200 && this.status < 300;
  }

  setHeaders(headers: Record<string, string | string[] | undefined>): Response {
    Object.assign(this.headers, headers);
    return this;
  }

  setHeader(key: string, value?: string | string[]): Response {
    this.headers[key] = value;
    return this;
  }
}
