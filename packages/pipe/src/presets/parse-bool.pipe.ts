import { createBadRequestError } from "./error";
import { PipeTransform } from "../pipe-transform";

export interface ParseBoolPipeOptions {
  ignoreNumber?: boolean;
  ignoreString?: boolean;
  trueValues?: any[];
  falseValues?: any[];
}

export class ParseBoolPipe
  implements PipeTransform<string | boolean | number, boolean>
{
  constructor(options?: ParseBoolPipeOptions) {
    this.#options = options ?? {};
  }
  readonly #options: ParseBoolPipeOptions;

  async transform({ value }) {
    if (typeof value == "boolean") {
      return value;
    } else if (!this.#options.ignoreNumber && (value == 1 || value == "1")) {
      return true;
    } else if (!this.#options.ignoreNumber && (value == 0 || value == "0")) {
      return false;
    } else if (
      !this.#options.ignoreString &&
      typeof value == "string" &&
      (value.toLowerCase() == "true" || value.toLowerCase() == "t")
    ) {
      return true;
    } else if (
      !this.#options.ignoreString &&
      typeof value == "string" &&
      (value.toLowerCase() == "false" || value.toLowerCase() == "f")
    ) {
      return false;
    } else if (
      this.#options.trueValues &&
      this.#options.trueValues.includes(value)
    ) {
      return true;
    } else if (
      this.#options.falseValues &&
      this.#options.falseValues.includes(value)
    ) {
      return false;
    }

    throw await createBadRequestError("Parse bool failed");
  }
}
