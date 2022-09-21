import { Request } from "@ipare/http";
import { parseInject } from "@ipare/inject";
import { JwtOptions, JwtService } from "../src";
import "../src";
import "@ipare/inject";
import { TestHttpStartup } from "@ipare/testing";
import { Context } from "@ipare/core";

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
  test: (jwtService: JwtService, ctx: Context) => Promise<void>,
  options: JwtOptions = {}
) {
  await new TestHttpStartup()
    .useInject()
    .useJwt(options)
    .use(async (ctx) => {
      const jwtService = await parseInject(ctx, JwtService);
      await test(jwtService, ctx);
    })
    .run();
}
