import { StatusCodes } from "http-status-codes";
import { ExceptionMessage } from "@halsp/common";
import { HttpException } from "./http-exception";

export class PreconditionFailedException extends HttpException {
  constructor(error?: string | ExceptionMessage) {
    super(StatusCodes.PRECONDITION_FAILED, error);
  }
}
