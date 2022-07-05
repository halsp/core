import { BadRequestException } from "@sfajs/core";
import { PipeTransform } from "./pipe-transform";

export interface TrimPipeOptions {
  start?: boolean;
  end?: boolean;
  notString?: (value: any) => string;
}

export class TrimPipe implements PipeTransform<string, string> {
  constructor(options?: TrimPipeOptions) {
    this.#options = Object.assign(
      {
        start: true,
        end: true,
      },
      options ?? {}
    );
  }
  readonly #options: TrimPipeOptions;

  transform({ value }) {
    if (typeof value != "string" && !!this.#options.notString) {
      return this.#options.notString(value);
    }

    if (typeof value != "string") {
      throw new BadRequestException("Validation failed (string is expected)");
    }

    if (this.#options.start && this.#options.end) {
      return value.trim();
    } else if (this.#options.start) {
      return value.trimStart();
    } else if (this.#options.end) {
      return value.trimEnd();
    }
    return value;
  }
}
