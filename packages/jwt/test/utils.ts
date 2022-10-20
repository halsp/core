import { parseInject } from "@ipare/inject";
import { JwtOptions, JwtService } from "../src";
import "../src";
import "@ipare/inject";
import { TestStartup } from "@ipare/testing";
import { Context } from "@ipare/core";

export async function createTestContext(
  options: JwtOptions,
  payload: any = {},
  prefix = "Bearer "
): Promise<Context> {
  let token = "";
  await runJwtServiceTest(async (jwtService) => {
    token = await jwtService.sign(payload);
  }, options);
  const ctx = new Context();
  ctx.req["headers"] = {
    Authorization: prefix + token,
  };
  ctx.req["get"] = (key: string) => ctx.req["headers"][key];
  return ctx;
}

export async function runJwtServiceTest(
  test: (jwtService: JwtService, ctx: Context) => Promise<void>,
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
