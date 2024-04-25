import { safeImport } from "@halsp/core";

export async function createBadRequestError(message: string) {
  if (process.env.HALSP_ENV == "http") {
    const { BadRequestException } = await safeImport("@halsp/http");
    return new BadRequestException(message);
  } else if (process.env.HALSP_ENV == "micro") {
    const { MicroException } = await safeImport("@halsp/micro/server");
    return new MicroException(message);
  } else {
    return new Error(message);
  }
}
