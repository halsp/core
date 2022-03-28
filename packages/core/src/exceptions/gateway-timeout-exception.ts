import { StatusCodes } from "http-status-codes";
import { Dict } from "../utils/types";
import { HttpException } from "./http-exception";

export class GatewayTimeoutException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.GATEWAY_TIMEOUT, error);
  }
}
