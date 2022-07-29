import { getEnv } from "./utils";

test("empty options", async () => {
  const env = await getEnv();
  expect(env.BNAME).toBe("BASE");
  expect(env.NAME).toBeUndefined();
  expect(env.SNAME).toBeUndefined();
});
