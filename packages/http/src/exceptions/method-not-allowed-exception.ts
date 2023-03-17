import { StatusCodes } from "http-status-codes";
import { ExceptionMessage } from "@halsp/core";
import { HttpException } from "./http-exception";

export class MethodNotAllowedException extends HttpException {
  constructor(error?: string | ExceptionMessage) {
    super(StatusCodes.METHOD_NOT_ALLOWED, error);
  }
}
