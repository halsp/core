import { Response, Request, Startup } from "@halsp/core";
import "@halsp/native";
import "../src";

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
    await new Startup()
      .keepThrow()
      .useHttp()
      .expect((res) => {
        res.expect(404);
      });
  });

  it("should set status 200", async () => {
    await new Startup()
      .useHttp()
      .use((ctx) => {
        ctx.res.ok();
      })
      .expect((res) => {
        res.expect(200);
      });
  });

  it("status shound be 500 if skip throw error", async () => {
    await new Startup()
      .useHttp()
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
    const startup = new Startup()
      .keepThrow()
      .useHttp()
      .use(() => {
        throw new Error("err");
      });

    let err = false;
    try {
      await startup.test();
    } catch {
      err = true;
    }
    expect(err).toBeTruthy();
  });
});

describe("server startup", () => {
  it("should set body", async () => {
    await new Startup()
      .keepThrow()
      .useNative()
      .use((ctx) => {
        ctx.res.ok({
          method: ctx.req.method,
          path: ctx.req.path,
        });
      })
      .nativeTest()
      .get("/url")
      .expect(200, {
        method: "GET",
        path: "url",
      });
  });

  it("status shound be 500 if skip throw error", async () => {
    await new Startup()
      .useNative()
      .use(() => {
        throw new Error("err");
      })
      .nativeTest()
      .get("")
      .expect(500, {
        status: 500,
        message: "err",
      });
  });

  it("shound throw error", async () => {
    let errMsg: string | undefined;
    try {
      await new Startup()
        .keepThrow()
        .useNative()
        .use(() => {
          throw new Error("err");
        })
        .nativeTest()
        .get("");
    } catch (err) {
      errMsg = (err as Error).message;
    }
    expect(errMsg).toBe("err");
  });
});
