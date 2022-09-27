import { Context } from "@ipare/core";

export function createBadRequestError(ctx: Context, message: string) {
  if (ctx["res"]) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { BadRequestException } = require("@ipare/http");
    return new BadRequestException(message);
  } else if (ctx["msg"]) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MicroException } = require("@ipare/micro");
    return new MicroException(message);
  } else {
    return new Error(message);
  }
}
