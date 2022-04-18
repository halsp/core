import { SfaRequest } from "@sfajs/core";
import { JwtOptions } from "../src";
import { JwtService } from "../src/jwt.service";

export function createJwtService(options?: JwtOptions): JwtService {
  return new JwtService(options);
}

export async function createSfaReqeust(
  options: JwtOptions,
  payload: any = {},
  prefix = "Bearer "
): Promise<SfaRequest> {
  const jwtService = createJwtService(options);
  const token = await jwtService.sign(payload);
  return new SfaRequest().setHeader("Authorization", prefix + token);
}
