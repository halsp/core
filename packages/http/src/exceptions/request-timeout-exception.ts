import { StatusCodes } from "http-status-codes";
import { Dict } from "@ipare/core";
import { HttpException } from "./http-exception";

export class RequestTimeoutException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.REQUEST_TIMEOUT, error);
  }
}
