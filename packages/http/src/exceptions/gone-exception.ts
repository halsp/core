import { StatusCodes } from "http-status-codes";
import { Dict } from "@ipare/core";
import { HttpException } from "./http-exception";

export class GoneException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.GONE, error);
  }
}
