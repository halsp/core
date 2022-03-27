import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class BadGatewayException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.BAD_GATEWAY, error);
  }
}
