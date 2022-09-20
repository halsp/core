import { StatusCodes } from "http-status-codes";
import { Dict } from "@ipare/core";
import { HttpException } from "./http-exception";

export class BadRequestException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.BAD_REQUEST, error);
  }
}
