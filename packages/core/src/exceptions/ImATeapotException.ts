import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class ImATeapotException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.IM_A_TEAPOT, error);
  }
}
