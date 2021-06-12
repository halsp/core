import { StatusCodes } from "http-status-codes";
import HeadersHandler from "../HeadersHandler";

type headerValueType = string | string[] | undefined;
type headersType = Record<string, headerValueType>;

export default class Response extends HeadersHandler {
  constructor(
    public status: StatusCodes = StatusCodes.NOT_FOUND,
    public body: unknown = undefined,
    headers = <headersType>{
      sfa: "https://github.com/sfajs/sfa",
    }
  ) {
    super();
    this.setHeaders(headers);
  }

  get isSuccess(): boolean {
    return this.status >= 200 && this.status < 300;
  }
}
