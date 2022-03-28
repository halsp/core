import { StatusCodes } from "http-status-codes";
import { Dict } from "../utils/types";
import { HttpException } from "./http-exception";

export class UnprocessableEntityException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, error);
  }
}
