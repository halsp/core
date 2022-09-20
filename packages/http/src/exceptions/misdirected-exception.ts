import { StatusCodes } from "http-status-codes";
import { Dict } from "@ipare/core";
import { HttpException } from "./http-exception";

export class MisdirectedException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.MISDIRECTED_REQUEST, error);
  }
}
