export function createBadRequestError(message: string | string[]) {
  if (process.env.HALSP_ENV == "http") {
    const { BadRequestException } = _require("@halsp/http");
    return new BadRequestException(message);
  } else if (process.env.HALSP_ENV == "micro") {
    const { MicroException } = _require("@halsp/micro");
    return new MicroException(message);
  } else {
    return new Error(Array.isArray(message) ? message.join(", ") : message);
  }
}
