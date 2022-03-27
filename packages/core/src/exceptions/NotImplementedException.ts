import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class NotImplementedException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.NOT_IMPLEMENTED, error);
  }
}
