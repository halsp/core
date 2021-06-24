import { StatusCodes } from "http-status-codes";
import HeadersHandler from "../HeadersHandler";

export default class Response extends HeadersHandler {
  constructor(
    public status: StatusCodes = StatusCodes.NOT_FOUND,
    public body: unknown = undefined,
    headers = {}
  ) {
    super();
    this.setHeaders(headers);
    this.setHeader("sfa", "https://github.com/sfajs/sfa");
  }

  get isSuccess(): boolean {
    return this.status >= 200 && this.status < 300;
  }
}
