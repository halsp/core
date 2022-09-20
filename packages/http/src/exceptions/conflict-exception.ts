import { StatusCodes } from "http-status-codes";
import { Dict } from "@ipare/core";
import { HttpException } from "./http-exception";

export class ConflictException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.CONFLICT, error);
  }
}
