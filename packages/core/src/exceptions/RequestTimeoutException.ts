import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class RequestTimeoutException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.REQUEST_TIMEOUT, error);
  }
}
