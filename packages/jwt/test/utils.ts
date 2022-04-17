import { SfaRequest } from "@sfajs/core";
import { JwtOptions } from "../src";
import { JwtService } from "../src/jwt.service";

export function createjwtService(options?: JwtOptions): JwtService {
  return new JwtService(options);
}

export async function createSfaReqeust(
  options: JwtOptions,
  payload: any = {},
  prefix = "Bearer "
): Promise<SfaRequest> {
  const jwtService = createjwtService(options);
  const token = await jwtService.sign(payload);
  return new SfaRequest().setHeader("Authorization", prefix + token);
}
