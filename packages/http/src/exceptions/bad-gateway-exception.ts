import { StatusCodes } from "http-status-codes";
import { Dict } from "@ipare/core";
import { HttpException } from "./http-exception";

export class BadGatewayException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.BAD_GATEWAY, error);
  }
}
