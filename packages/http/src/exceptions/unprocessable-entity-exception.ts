import { StatusCodes } from "http-status-codes";
import { ExceptionMessage } from "@halsp/core";
import { HttpException } from "./http-exception";

export class UnprocessableEntityException extends HttpException {
  constructor(error?: string | ExceptionMessage) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, error);
  }
}
