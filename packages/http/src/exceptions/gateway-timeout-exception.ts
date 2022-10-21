import { StatusCodes } from "http-status-codes";
import { ExceptionMessage } from "@ipare/core";
import { HttpException } from "./http-exception";

export class GatewayTimeoutException extends HttpException {
  constructor(error?: string | ExceptionMessage) {
    super(StatusCodes.GATEWAY_TIMEOUT, error);
  }
}
