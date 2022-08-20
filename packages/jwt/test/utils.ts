import { HttpContext, Request } from "@ipare/core";
import { parseInject } from "@ipare/inject";
import { JwtOptions, JwtService } from "../src";
import "../src";
import "@ipare/inject";
import { TestStartup } from "@ipare/testing";

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
  test: (jwtService: JwtService, ctx: HttpContext) => Promise<void>,
  options: JwtOptions = {}
) {
  await new TestStartup()
    .useInject()
    .useJwt(options)
    .use(async (ctx) => {
      const jwtService = await parseInject(ctx, JwtService);
      await test(jwtService, ctx);
    })
    .run();
}
