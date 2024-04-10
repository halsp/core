import { Context, HookType, Startup } from "../../src";
import "../test-startup";

describe("context hook", () => {
  it("shoud create Context by hook", async () => {
    const { ctx } = await new Startup()
      .hook(HookType.Context, (args) => {
        const ctx = new Context();
        ctx.set("args", args);
        return ctx;
      })
      .run(1, 2, 3);
    expect(ctx.get("args")).toEqual([1, 2, 3]);
  });

  it("shoud create Context by default instance", async () => {
    const initCtx = new Context();
    const { ctx } = await new Startup().run(initCtx);
    expect(initCtx).toBe(ctx);
  });
});
