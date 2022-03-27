import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class HttpVersionNotSupportedException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.HTTP_VERSION_NOT_SUPPORTED, error);
  }
}
