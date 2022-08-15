import { TestHttpStartup } from "../src";

describe("default", () => {
  it("should set body", async () => {
    await new TestHttpStartup()
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
});

describe("skipThrow", () => {
  it("status shound be 500 if skip throw error", async () => {
    await new TestHttpStartup()
      .use(() => {
        throw new Error("err");
      })
      .skipThrow()
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
      await new TestHttpStartup()
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
