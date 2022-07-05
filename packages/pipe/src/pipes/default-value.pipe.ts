import { isNull, isNumber, isUndefined } from "@sfajs/core";
import { PipeTransform } from "./pipe-transform";

export interface DefaultValuePipeOptions {
  ignoreNull?: boolean;
  ignoreUndefined?: boolean;
  ignoreEmptyString?: boolean;
  ignoreNaN?: boolean;
}

export class DefaultValuePipe<T = any, R = any>
  implements PipeTransform<T, T | R>
{
  constructor(
    private readonly defaultValue: R,
    options?: DefaultValuePipeOptions
  ) {
    this.#options = options ?? {};
  }

  readonly #options: DefaultValuePipeOptions;

  transform({ value }): T | R {
    if (!this.#options.ignoreUndefined && isUndefined(value)) {
      return this.defaultValue;
    } else if (!this.#options.ignoreNull && isNull(value)) {
      return this.defaultValue;
    } else if (!this.#options.ignoreEmptyString && value == "") {
      return this.defaultValue;
    } else if (!this.#options.ignoreNaN && isNumber(value) && value != value) {
      return this.defaultValue;
    } else {
      return value;
    }
  }
}
