import { TestStartup } from "../test-startup";

function runLoadConfig(success: boolean, type: string) {
  test(`load config ${type} ${success}`, async () => {
    const startup = new TestStartup(undefined, `test/config/${type}`).use(
      (ctx) => {
        ctx.ok(ctx.config);
      }
    );
    const res = await startup.run();

    expect(res.status).toBe(200);
    if (success) {
      expect(res.body).toEqual({
        customMethods: ["CUSTOM1", "CUSTOM2"],
      });
    } else {
      expect(res.body).toEqual({});
    }
  });
}

runLoadConfig(true, "ts");
runLoadConfig(true, "js");
runLoadConfig(false, "err");
