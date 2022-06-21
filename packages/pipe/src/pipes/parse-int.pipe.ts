import { BadRequestException } from "@sfajs/core";
import { PipeTransform } from "./pipe-transform";

export class ParseIntPipe implements PipeTransform<string | number, number> {
  transform(value: string | number) {
    if (typeof value == "string") {
      value = parseInt(value, 10);
    }

    if (value == value) {
      return Math.floor(value);
    }

    throw new BadRequestException(
      "Validation failed (numeric string is expected)"
    );
  }
}