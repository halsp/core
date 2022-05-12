import { loadConfig, SfaRequest, TestStartup } from "../../src";

function runLoadConfig(exist: boolean, type: string) {
  test(`load config ${type} ${exist}`, async () => {
    const config = loadConfig({
      root: `test/config/${type}`,
    });
    if (exist) {
      expect(config).toEqual({
        customMethods: [`CUSTOM${type.toUpperCase()}`],
        mode: type == "ts" ? "production" : undefined,
      });
    } else {
      expect(config).toEqual({});
    }
  });
}

runLoadConfig(true, "ts");
runLoadConfig(true, "js");
runLoadConfig(false, "err");

test(`startup config`, async () => {
  const startup = new TestStartup(new SfaRequest(), {
    root: `test/config/ts`,
    mode: "development",
  }).use((ctx) => {
    ctx.ok(ctx.config);
  });
  const res = await startup.run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    customMethods: ["CUSTOMTS"],
    mode: "development",
  });
});
