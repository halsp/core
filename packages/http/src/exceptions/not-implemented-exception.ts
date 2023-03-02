import { StatusCodes } from "http-status-codes";
import { ExceptionMessage } from "@halsp/common";
import { HttpException } from "./http-exception";

export class NotImplementedException extends HttpException {
  constructor(error?: string | ExceptionMessage) {
    super(StatusCodes.NOT_IMPLEMENTED, error);
  }
}
