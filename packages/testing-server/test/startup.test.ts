import { TestServerStartup } from "../src";

describe("startup", () => {
  it("should set body", async () => {
    await new TestServerStartup()
      .use((ctx) => {
        ctx.ok({
          method: ctx.req.method,
          path: ctx.req.path,
        });
      })
      .create()
      .get("/url")
      .expect(200, {
        method: "GET",
        path: "url",
      });
  });

  it("status shound be 500 if skip throw error", async () => {
    await new TestServerStartup()
      .use(() => {
        throw new Error("err");
      })
      .setSkipThrow()
      .create()
      .get("")
      .expect(500, {
        status: 500,
        message: "err",
      });
  });

  it("shound throw error", async () => {
    let errMsg: string | undefined;
    try {
      await new TestServerStartup()
        .use(() => {
          throw new Error("err");
        })
        .create()
        .get("");
    } catch (err) {
      errMsg = (err as Error).message;
    }
    expect(errMsg).toBe("err");
  });
});
