import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class GatewayTimeoutException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.GATEWAY_TIMEOUT, error);
  }
}
