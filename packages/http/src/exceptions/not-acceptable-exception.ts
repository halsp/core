import { StatusCodes } from "http-status-codes";
import { ExceptionMessage } from "@ipare/core";
import { HttpException } from "./http-exception";

export class NotAcceptableException extends HttpException {
  constructor(error?: string | ExceptionMessage) {
    super(StatusCodes.NOT_ACCEPTABLE, error);
  }
}
