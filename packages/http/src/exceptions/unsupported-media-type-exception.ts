import { StatusCodes } from "http-status-codes";
import { ExceptionMessage } from "@halsp/core";
import { HttpException } from "./http-exception";

export class UnsupportedMediaTypeException extends HttpException {
  constructor(error?: string | ExceptionMessage) {
    super(StatusCodes.UNSUPPORTED_MEDIA_TYPE, error);
  }
}
