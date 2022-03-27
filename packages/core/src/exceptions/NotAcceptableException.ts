import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class NotAcceptableException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.NOT_ACCEPTABLE, error);
  }
}
