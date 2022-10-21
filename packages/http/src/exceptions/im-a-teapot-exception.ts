import { StatusCodes } from "http-status-codes";
import { ExceptionMessage } from "@ipare/core";
import { HttpException } from "./http-exception";

export class ImATeapotException extends HttpException {
  constructor(error?: string | ExceptionMessage) {
    super(StatusCodes.IM_A_TEAPOT, error);
  }
}
