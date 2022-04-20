import { BadRequestException } from "@sfajs/core";
import { PipeTransform } from "./pipe-transform";

export class ParseBoolPipe implements PipeTransform<string | boolean, boolean> {
  transform(value: string | boolean) {
    if (typeof value == "number") {
      if (value == 1) {
        return true;
      } else if (value == 0) {
        return false;
      }
    } else if (typeof value == "boolean") {
      return value;
    } else {
      const str = value?.toString();
      if (str?.toLowerCase() == "true" || str == "1") {
        return true;
      } else if (str?.toLowerCase() == "false" || str == "0") {
        return false;
      }
    }
    throw new BadRequestException(
      "Validation failed (boolean string is expected)"
    );
  }
}
