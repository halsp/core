import { isObject, isString } from "./utils";

export type ExceptionMessage = object & { message: string };

export function isExceptionMessage(
  error: any
): error is string | ExceptionMessage {
  if (!error) return false;

  return isString(error) || (isObject(error) && !!error.message);
}

export class IpareException extends Error {
  constructor(public readonly error?: string | ExceptionMessage) {
    super("");

    this.name = this.constructor.name;

    if (isString(error)) {
      this.message = error;
    } else if (error && isObject(error)) {
      this.message = error.message ?? "";
    }
  }

  public breakthrough = false;
  public setBreakthrough(breakthrough = true): this {
    this.breakthrough = breakthrough;
    return this;
  }
}
