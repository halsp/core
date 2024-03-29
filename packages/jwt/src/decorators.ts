import { Inject } from "@halsp/inject";
import "reflect-metadata";
import { JwtService } from "./jwt.service";

export const JwtToken = Inject((ctx) => ctx.jwtToken);
export const JwtObject = Inject(async (ctx) => {
  const jwtService = await ctx.getService(JwtService);
  return jwtService.decode({
    complete: true,
    json: true,
  });
});
export const JwtPayload = Inject(async (ctx) => {
  const jwtService = await ctx.getService(JwtService);
  return jwtService.decode({
    complete: false,
    json: true,
  });
});
