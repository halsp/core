import { Response, Request } from "@halsp/common";
import { TestHttpStartup, TestNativeStartup } from "../src/http";
new TestHttpStartup();

describe("response.expect", () => {
  it("should expect status 200", async () => {
    new Response().setStatus(200).expect(200);
  });

  it("should expect body", async () => {
    new Response()
      .setStatus(200)
      .setBody({
        a: 1,
      })
      .expect({
        a: 1,
      });
  });

  it("should expect status and body", async () => {
    new Response()
      .setStatus(200)
      .setBody({
        a: 1,
      })
      .expect(200, {
        a: 1,
      });
  });

  it("should expect checker", async () => {
    new Response().setStatus(200).expect((res) => {
      expect(res.status).toBe(200);
    });
  });
});

describe("http startup", () => {
  it("default status is 404", async () => {
    await new TestHttpStartup().expect((res) => {
      res.expect(404);
    });
  });

  it("should set status 200", async () => {
    await new TestHttpStartup()
      .use((ctx) => {
        ctx.res.ok();
      })
      .expect((res) => {
        res.expect(200);
      });
  });

  it("status shound be 500 if skip throw error", async () => {
    await new TestHttpStartup()
      .setSkipThrow()
      .setContext(new Request())
      .use(() => {
        throw new Error("err");
      })
      .expect((res) => {
        res.expect(500, {
          status: 500,
          message: "err",
        });
      });
  });

  it("should throw error", async () => {
    const startup = new TestHttpStartup().use(() => {
      throw new Error("err");
    });

    let err = false;
    try {
      await startup.run();
    } catch {
      err = true;
    }
    expect(err).toBeTruthy();
  });
});

describe("server startup", () => {
  it("should set body", async () => {
    await new TestNativeStartup()
      .use((ctx) => {
        ctx.res.ok({
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
    await new TestNativeStartup()
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
      await new TestNativeStartup()
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
