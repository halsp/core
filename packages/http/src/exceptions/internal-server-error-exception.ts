import { StatusCodes } from "http-status-codes";
import { Dict } from "@ipare/core";
import { HttpException } from "./http-exception";

export class InternalServerErrorException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
}
