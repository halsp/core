import { Request, TestStartup } from "@ipare/core";
import { parseInject } from "@ipare/inject";
import { JwtOptions, JwtService } from "../src";
import "../src";
import "@ipare/inject";
import { OPTIONS_BAG } from "../src/constant";

export async function createIpareReqeust(
  options: JwtOptions,
  payload: any = {},
  prefix = "Bearer "
): Promise<Request> {
  let token = "";
  await runJwtServiceTest(async (jwtService) => {
    token = await jwtService.sign(payload);
  }, options);
  return new Request().setHeader("Authorization", prefix + token);
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
