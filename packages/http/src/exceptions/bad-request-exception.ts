import { StatusCodes } from "http-status-codes";
import { ExceptionMessage } from "@halsp/common";
import { HttpException } from "./http-exception";

export class BadRequestException extends HttpException {
  constructor(error?: string | ExceptionMessage) {
    super(StatusCodes.BAD_REQUEST, error);
  }
}
