import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class MethodNotAllowedException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.METHOD_NOT_ALLOWED, error);
  }
}
