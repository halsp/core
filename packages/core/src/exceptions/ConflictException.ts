import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class ConflictException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.CONFLICT, error);
  }
}
