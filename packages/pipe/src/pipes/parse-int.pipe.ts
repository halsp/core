import { createBadRequestError } from "./error";
import { PipeTransform } from "./pipe-transform";

export class ParseIntPipe implements PipeTransform<string | number, number> {
  transform({ value }) {
    if (typeof value == "string") {
      value = parseInt(value, 10);
    }

    if (value == value) {
      return Math.floor(value);
    }

    throw createBadRequestError(
      "Validation failed (numeric string is expected)"
    );
  }
}
