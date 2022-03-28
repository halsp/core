import { StatusCodes } from "http-status-codes";
import { Dict } from "../utils/types";
import { HttpException } from "./http-exception";

export class MethodNotAllowedException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.METHOD_NOT_ALLOWED, error);
  }
}
