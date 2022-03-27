import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class ForbiddenException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.FORBIDDEN, error);
  }
}
