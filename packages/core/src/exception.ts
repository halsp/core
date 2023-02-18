import * as honion from "honion";
import { isObject, isString } from "./utils";

export type ExceptionMessage = object & {
  message: string;
  [key: string]: any;
};

export function isExceptionMessage(
  error: any
): error is string | ExceptionMessage {
  if (!error) return false;

  return isString(error) || (isObject(error) && !!error.message);
}

export class IpareException extends honion.HonionException {
  constructor(public readonly error?: string | ExceptionMessage) {
    super(error);
  }
}
