import { HookType, Startup } from "../../src";
import "../test-startup";

describe("begining hook", () => {
  it("shoud create Context by hook", async () => {
    const { ctx } = await new Startup()
      .hook(HookType.BeforeInvoke, (ctx) => {
        ctx.set("res", ctx.get("begining"));
      })
      .hook(HookType.Begining, (ctx) => {
        ctx.set("begining", true);
      })
      .use(() => {})
      .run();
    expect(ctx.get("res")).toBeTruthy();
  });

  it("shoud stop invoke when Begining hook return false", async () => {
    const { ctx } = await new Startup()
      .hook(HookType.Begining, () => {
        return false;
      })
      .use((ctx) => {
        ctx.set("res", true);
      })
      .run();
    expect(ctx.get("res")).toBeUndefined();
  });
});
