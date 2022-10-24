import { Context, Startup } from "@ipare/core";
import { initBaseTestStartup, ITestStartup, TestStartup } from "../src";

describe("startup", () => {
  it("should add error to stack if skip throw error", async () => {
    await new TestStartup()
      .setSkipThrow()
      .setContext(new Context())
      .use(() => {
        throw new Error("err");
      })
      .expect((res) => {
        expect(res.ctx.errorStack.length).toBe(1);
      });
  });

  it("error shound be throw", async () => {
    let errMsg: string | undefined;
    try {
      await new TestStartup()
        .setSkipThrow(false)
        .use(() => {
          throw new Error("err");
        })
        .run();
    } catch (err) {
      errMsg = (err as Error).message;
    }
    expect(errMsg).toBe("err");
  });

  it("should init startup by initBaseTestStartup", async () => {
    class CustomStartup extends Startup {
      constructor() {
        super();
        initBaseTestStartup(this);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface CustomStartup extends ITestStartup {}

    expect(typeof new CustomStartup().setContext).toBe("function");
  });
});
