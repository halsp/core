import { StatusCodes } from "http-status-codes";
import { ExceptionMessage } from "@halsp/core";
import { HttpException } from "./http-exception";

export class ConflictException extends HttpException {
  constructor(error?: string | ExceptionMessage) {
    super(StatusCodes.CONFLICT, error);
  }
}
