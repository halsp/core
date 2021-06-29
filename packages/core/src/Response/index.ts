import { StatusCodes } from "http-status-codes";
import { HeaderValueType } from "../HeadersHandler";
import ResultHandler from "../ResultHandler";

export default class Response extends ResultHandler {
  #headers: NodeJS.Dict<HeaderValueType> = {};

  constructor(
    public status: StatusCodes = StatusCodes.NOT_FOUND,
    public body: unknown = undefined,
    headers = {}
  ) {
    super(() => this);
    this.setHeaders(headers);
    this.setHeader("sfa", "https://github.com/sfajs/sfa");
  }

  get isSuccess(): boolean {
    return this.status >= 200 && this.status < 300;
  }

  get headers(): NodeJS.ReadOnlyDict<HeaderValueType> {
    return this.#headers;
  }
}
