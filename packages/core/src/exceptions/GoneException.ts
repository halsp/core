import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class GoneException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.GONE, error);
  }
}
