import { SfaRequest, TestStartup } from "@sfajs/core";
import { parseInject } from "@sfajs/inject";
import { JwtOptions, JwtService } from "../src";
import "../src";
import "@sfajs/inject";
import { OPTIONS_BAG } from "../src/constant";

export async function createSfaReqeust(
  options: JwtOptions,
  payload: any = {},
  prefix = "Bearer "
): Promise<SfaRequest> {
  let token = "";
  await runJwtServiceTest(async (jwtService) => {
    token = await jwtService.sign(payload);
  }, options);
  return new SfaRequest().setHeader("Authorization", prefix + token);
}

export async function runJwtServiceTest(
  test: (jwtService: JwtService) => Promise<void>,
  options?: JwtOptions
) {
  await new TestStartup()
    .useInject()
    .use(async (ctx, next) => {
      ctx.bag(OPTIONS_BAG, options);
      await next();
    })
    .use(async (ctx) => {
      const jwtService = await parseInject(ctx, JwtService);
      await test(jwtService);
    })
    .run();
}
