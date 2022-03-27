import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class PreconditionFailedException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.PRECONDITION_FAILED, error);
  }
}
