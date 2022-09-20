import { StatusCodes } from "http-status-codes";
import { Dict } from "@ipare/core";
import { HttpException } from "./http-exception";

export class UnauthorizedException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.UNAUTHORIZED, error);
  }
}
