import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class UnsupportedMediaTypeException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.UNSUPPORTED_MEDIA_TYPE, error);
  }
}
