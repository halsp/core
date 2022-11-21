import "../src";
import { getEnv } from "./utils";

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
  const env = await getEnv({
    mode: "stage",
    override: true,
  });
  expect(env.NAME).toBe("STAGE");
});

test("default mode", async () => {
  delete process.env.NODE_ENV;
  await getEnv();
  expect(process.env.NODE_ENV).toBe("production");
});
