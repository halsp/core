import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class NotFoundException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.NOT_FOUND, error);
  }
}
