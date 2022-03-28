import { StatusCodes } from "http-status-codes";
import { Dict } from "../utils/types";
import { HttpException } from "./http-exception";

export class HttpVersionNotSupportedException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.HTTP_VERSION_NOT_SUPPORTED, error);
  }
}
