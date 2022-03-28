import { StatusCodes } from "http-status-codes";
import { Dict } from "../utils/types";
import { HttpException } from "./http-exception";

export class UnsupportedMediaTypeException extends HttpException {
  constructor(error?: string | Dict) {
    super(StatusCodes.UNSUPPORTED_MEDIA_TYPE, error);
  }
}
