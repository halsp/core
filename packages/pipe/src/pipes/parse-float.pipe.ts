import { createBadRequestError } from "./error";
import { PipeTransform } from "./pipe-transform";

export class ParseFloatPipe implements PipeTransform<string | number, number> {
  transform({ ctx, value }) {
    if (typeof value == "string") {
      value = parseFloat(value);
    }

    if (value == value) {
      return value;
    }

    throw createBadRequestError(
      ctx,
      "Validation failed (numeric string is expected)"
    );
  }
}
