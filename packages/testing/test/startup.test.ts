import { Context, HookType, Startup } from "@halsp/core";
import "../src";

describe("startup", () => {
  it("should remove error when expectError success", async () => {
    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("err");
      })
      .hook(HookType.Unhandled, (ctx, md, err) => {
        ctx.set("err", err);
      })
      .setContext(new Context())
      .use(() => {
        throw new Error("err");
      })
      .test();
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
