import { isObject, isString } from "./utils";

export class IpareException extends Error {
  constructor(
    protected readonly error?: string | (object & { message: string })
  ) {
    super("");

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
