import { StatusCodes } from "http-status-codes";
import { Dict } from "../utils/types";
import { HttpException } from "./http-exception";

export class RequestTooLongException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.REQUEST_TOO_LONG, error);
  }
}
