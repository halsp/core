import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class MisdirectedException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.MISDIRECTED_REQUEST, error);
  }
}
