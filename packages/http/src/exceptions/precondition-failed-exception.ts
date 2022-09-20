import { StatusCodes } from "http-status-codes";
import { Dict } from "@ipare/core";
import { HttpException } from "./http-exception";

export class PreconditionFailedException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.PRECONDITION_FAILED, error);
  }
}
