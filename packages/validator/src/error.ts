export function createBadRequestError(message: string | string[]) {
  if (process.env.IPARE_ENV == "http") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { BadRequestException } = require("@ipare/http");
    return new BadRequestException(message);
  } else if (process.env.IPARE_ENV == "micro") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MicroException } = require("@ipare/micro");
    return new MicroException(message);
  } else {
    return new Error(Array.isArray(message) ? message.join(", ") : message);
  }
}
