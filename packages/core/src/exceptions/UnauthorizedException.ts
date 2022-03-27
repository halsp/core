import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class UnauthorizedException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.UNAUTHORIZED, error);
  }
}
