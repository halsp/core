import { Context, HookType, Startup } from "@halsp/core";
import "../src";

describe("startup", () => {
  it("should add error to stack if skip throw error", async () => {
    await new Startup()
      .hook(HookType.Unhandled, (ctx, md, err) => {
        ctx.set("err", err);
      })
      .setContext(new Context())
      .use(() => {
        throw new Error("err");
      })
      .expect((res) => {
        expect(res.ctx.get("err")).not.toBeUndefined();
      });
  });

  it("error shound be throw", async () => {
    let errMsg: string | undefined;
    try {
      await new Startup()
        .keepThrow()
        .keepThrow()
        .use(() => {
          throw new Error("err");
        })
        .test();
    } catch (err) {
      errMsg = (err as Error).message;
    }
    expect(errMsg).toBe("err");
  });
});
