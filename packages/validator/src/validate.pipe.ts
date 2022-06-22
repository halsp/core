import { BadRequestException, isPlainObject } from "@sfajs/core";
import { PipeTransform } from "@sfajs/pipe";
import { validate } from "class-validator";

export class ValidatePipe<T extends object = any, R extends T = any>
  implements PipeTransform<T, T | R>
{
  async transform(value: T) {
    if (
      typeof value == "object" &&
      !Array.isArray(value) &&
      !isPlainObject(value)
    ) {
      const errs = await validate(value);
      const msgs = errs
        .filter((item) => !!item.constraints)
        .map((item) => item.constraints as Record<string, string>)
        .map((cons) => cons[Object.keys(cons)[0]]);
      if (msgs.length) {
        throw new BadRequestException({
          message: msgs.length == 1 ? msgs[0] : msgs,
        });
      }
    }

    return value;
  }
}
