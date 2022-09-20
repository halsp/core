import { StatusCodes } from "http-status-codes";
import { Dict } from "@ipare/core";
import { HttpException } from "./http-exception";

export class ServiceUnavailableException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.SERVICE_UNAVAILABLE, error);
  }
}
