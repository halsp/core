import { getEnv } from "./utils";

test("mode options development", async () => {
  const env = await getEnv({
    mode: "development",
    override: true,
  });
  expect(env.BNAME).toBe("DEVELOPMENT");
  expect(env.NAME).toBe("DEVELOPMENT");
  expect(env.SNAME).toBe("DEV");
});

test("mode options production", async () => {
  const env = await getEnv({
    mode: "production",
    override: true,
  });
  expect(env.BNAME).toBe("PRODUCTION");
  expect(env.NAME).toBe("PRODUCTION");
  expect(env.SNAME).toBe("PROD");
});
