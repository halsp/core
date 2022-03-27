import { StatusCodes } from "http-status-codes";
import { Dict } from "../types";
import { HttpException } from "./HttpException";

export class UnprocessableEntityException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, error);
  }
}
