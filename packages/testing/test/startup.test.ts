import { Context } from "@ipare/core";
import { TestStartup } from "../src";

describe("startup", () => {
  new TestStartup()
    .skipThrow()
    .setContext(new Context())
    .use(() => {
      throw new Error("err");
    })
    .it("should add error to stack if skip throw error", (res) => {
      expect(res.ctx.errorStack.length).toBe(1);
    });

  it("error shound be throw", async () => {
    let errMsg: string | undefined;
    try {
      await new TestStartup()
        .use(() => {
          throw new Error("err");
        })
        .run();
    } catch (err) {
      errMsg = (err as Error).message;
    }
    expect(errMsg).toBe("err");
  });
});
