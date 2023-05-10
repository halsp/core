import { Startup } from "@halsp/core";
import { handleMessage, MicroException } from "../src";
import "@halsp/testing";

describe("startup", () => {
  it("should set env", () => {
    process.env.HALSP_ENV = "" as any;
    new Startup().useMicro();
    expect(process.env.HALSP_ENV).toBe("micro");
  });

  it("should set error if throw MicroException", async () => {
    const res = await new Startup()
      .useMicro()
      .use(() => {
        throw new MicroException("err");
      })
      .test();

    expect(res.error).toBe("err");
    expect(res.body).toBeUndefined();
  });
});

describe("handle message", () => {
  it("should handle message and send result", async () => {
    const startup = new Startup();
    await handleMessage.bind(startup)(`{"id":"abc"}`, ({ req, result }) => {
      expect(req.id).toBe("abc");
      expect(result).toEqual({ id: "abc" });
    });
  });

  it("should handle message and invoke prehook", async () => {
    const startup = new Startup();
    await handleMessage.bind(startup)(
      `{}`,
      () => {
        expect(true).toBe(false);
      },
      (ctx) => {
        expect(ctx.req.id).toBeUndefined();
      }
    );
  });

  it("should log error when message format is illegal", async () => {
    const startup = new Startup();
    let error: any;
    try {
      await handleMessage.bind(startup)(`abc`, () => {
        expect(true).toBe(false);
      });
    } catch (err) {
      error = err;
    }
    expect(!!error).toBeTruthy();
  });

  it("should return error message when res.error is not empty", async () => {
    const startup = new Startup();
    await handleMessage.bind(startup)(
      `{"id":"abc"}`,
      ({ req, result }) => {
        expect(req.id).toBe("abc");
        expect(result).toEqual({ id: "abc", error: "err" });
      },
      (ctx) => {
        ctx.res.setError("err");
      }
    );
  });
});
