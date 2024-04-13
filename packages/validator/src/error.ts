import { safeImport } from "@halsp/core";

export async function createBadRequestError(message: string | string[]) {
  if (process.env.HALSP_ENV == "http") {
    const { BadRequestException } = await safeImport("@halsp/http");
    return new BadRequestException(message);
  } else if (process.env.HALSP_ENV == "micro") {
    const { MicroException } = await safeImport("@halsp/micro");
    return new MicroException(message);
  } else {
    return new Error(Array.isArray(message) ? message.join(", ") : message);
  }
}
