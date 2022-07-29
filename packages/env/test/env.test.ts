import { TestStartup } from "@ipare/core";
import "../src";
import { getEnv } from "./utils";

test("empty options", async () => {
  const env = await getEnv();
  expect(env.BNAME).toBe("BASE");
  expect(env.NAME).toBeUndefined();
  expect(env.SNAME).toBeUndefined();
});

test("cwd", async () => {
  const res = await new TestStartup()
    .useConfig({
      mode: "production",
      cwd: "test/envs",
      override: true,
    })
    .use((ctx) => {
      ctx.ok(process.env);
    })
    .run();
  const env = res.body;

  expect(env.BNAME).toBe("PRODUCTION");
  expect(env.NAME).toBe("PRODUCTION");
  expect(env.SNAME).toBe("PROD");
});

test("mode options", async () => {
  const env = await getEnv({
    mode: "development",
    override: true,
  });
  expect(env.BNAME).toBe("DEVELOPMENT");
  expect(env.NAME).toBe("DEVELOPMENT");
  expect(env.SNAME).toBe("DEV");
});

test("mode", async () => {
  const env = await getEnv("stage");
  expect(env.NAME).toBe("STAGE");
});
