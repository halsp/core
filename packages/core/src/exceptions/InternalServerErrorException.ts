import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class InternalServerErrorException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
}
