import { getEnv } from "./utils";

test("mode", async () => {
  const env = await getEnv("stage");
  expect(env.BNAME).toBe("BASE");
  expect(env.NAME).toBe("STAGE");
  expect(env.SNAME).toBeUndefined();
});
