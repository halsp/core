import { TestStartup } from "@ipare/testing";
import "../src";
import { getEnv } from "./utils";

test("empty options", async () => {
  const env = await getEnv();
  expect(env.BNAME).toBe("BASE");
  expect(env.NAME).toBeUndefined();
  expect(env.SNAME).toBeUndefined();
});

test("cwd", async () => {
  const { ctx } = await new TestStartup()
    .useEnv({
      mode: "production",
      cwd: "test/envs",
      override: true,
    })
    .use((ctx) => {
      ctx.bag("env", process.env);
    })
    .run();
  const env = ctx.bag<typeof process.env>("env");

  expect(env.BNAME).toBe("PRODUCTION");
  expect(env.NAME).toBe("PRODUCTION");
  expect(env.SNAME).toBe("PROD");
});
