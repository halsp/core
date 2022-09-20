import { Context } from "@ipare/core";
import { Request } from "@ipare/http";
import { TestHttpStartup, TestServerStartup, TestStartup } from "../src";

describe("default", () => {
  new TestHttpStartup().it("default status is 404", (res) => {
    res.expect(404);
  });

  new TestHttpStartup()
    .use((ctx) => {
      ctx.ok();
    })
    .it("should set status 200", (res) => {
      res.expect(200);
    });

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
});

describe("skipThrow", () => {
  new TestHttpStartup()
    .skipThrow()
    .setRequest(new Request())
    .use(() => {
      throw new Error("err");
    })
    .it("status shound be 500 if skip throw error", (res) => {
      res.expect(500, {
        status: 500,
        message: "err",
      });
    });

  new TestStartup()
    .skipThrow()
    .setContext(new Context())
    .use(() => {
      throw new Error("err");
    })
    .it("should add error to stack if skip throw error", (ctx) => {
      expect(ctx.errorStack.length).toBe(1);
    });

  it("error shound be throw", async () => {
    let errMsg: string | undefined;
    try {
      await new TestHttpStartup()
        .use(() => {
          throw new Error("err");
        })
        .run();
    } catch (err) {
      errMsg = (err as Error).message;
    }
    expect(errMsg).toBe("err");
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

  it("status shound be 500 if skip throw error", async () => {
    await new TestServerStartup()
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
