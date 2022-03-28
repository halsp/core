import { StatusCodes } from "http-status-codes";
import { Dict } from "../utils/types";
import { HttpException } from "./http-exception";

export class NotImplementedException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.NOT_IMPLEMENTED, error);
  }
}
