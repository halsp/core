import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class BadRequestException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.BAD_REQUEST, error);
  }
}
