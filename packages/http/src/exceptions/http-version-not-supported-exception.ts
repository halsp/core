import { StatusCodes } from "http-status-codes";
import { ExceptionMessage } from "@halsp/common";
import { HttpException } from "./http-exception";

export class HttpVersionNotSupportedException extends HttpException {
  constructor(error?: string | ExceptionMessage) {
    super(StatusCodes.HTTP_VERSION_NOT_SUPPORTED, error);
  }
}
