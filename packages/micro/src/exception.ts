import { Dict, isObject, isString } from "@ipare/core";

export class MicroException extends Error {
  constructor(private readonly error?: string | Dict) {
    super("");

    if (isString(error)) {
      this.message = error;
    } else if (
      isObject<{ message?: string }>(error) &&
      isString(error.message)
    ) {
      this.message = error.message;
    }
  }

  #breakthrough = false;
  public get breakthrough(): boolean {
    return this.#breakthrough;
  }
  public setBreakthrough(breakthrough = true): this {
    this.#breakthrough = breakthrough;
    return this;
  }

  public toPlainObject() {
    const obj = {
      status: "error",
      message: this.message,
    };
    if (this.error && !isString(this.error)) {
      return Object.assign(obj, this.error);
    } else {
      return obj;
    }
  }
}
