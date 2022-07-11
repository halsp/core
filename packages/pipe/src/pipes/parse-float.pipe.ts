import { BadRequestException } from "@ipare/core";
import { PipeTransform } from "./pipe-transform";

export class ParseFloatPipe implements PipeTransform<string | number, number> {
  transform({ value }) {
    if (typeof value == "string") {
      value = parseFloat(value);
    }

    if (value == value) {
      return value;
    }

    throw new BadRequestException(
      "Validation failed (numeric string is expected)"
    );
  }
}
