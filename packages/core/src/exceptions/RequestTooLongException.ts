import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class RequestTooLongException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.REQUEST_TOO_LONG, error);
  }
}
