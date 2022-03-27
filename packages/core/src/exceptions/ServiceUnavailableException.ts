import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class ServiceUnavailableException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.SERVICE_UNAVAILABLE, error);
  }
}
