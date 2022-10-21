import { StatusCodes } from "http-status-codes";
import { ExceptionMessage } from "@ipare/core";
import { HttpException } from "./http-exception";

export class InternalServerErrorException extends HttpException {
  constructor(error?: string | ExceptionMessage) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
}
