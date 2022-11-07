import { Context, Request } from "@ipare/core";
import { MicroException, MicroStartup } from "../src";
import { TestStartup } from "./utils";

describe("startup", () => {
  it("should set env", () => {
    process.env.IS_IPARE_MICRO = "" as any;
    new TestStartup();
    expect(process.env.IS_IPARE_MICRO).toBe("true");
  });

  it("should set error if throw MicroException", async () => {
    const res = await new TestStartup()
      .use(() => {
        throw new MicroException("err");
      })
      .run();

    expect(res.error).toBe("err");
    expect(res.body).toBeUndefined();
  });
});

describe("handle message", () => {
  class TestClass extends MicroStartup {}
  function handleMessage(
    text: string,
    onSend: (arg: { req: Request; result: string }) => void | Promise<void>,
    prehook?: (ctx: Context) => Promise<void> | void,
    onError?: (err: Error) => void
  ) {
    new TestClass()["handleMessage"](
      Buffer.from(text, "utf-8"),
      onSend,
      prehook,
      onError
    );
  }

  it("should handle message and send result", async () => {
    await new Promise<void>((resolve) => {
      handleMessage(`12#{"id":"abc"}`, ({ req, result }) => {
        expect(req.id).toBe("abc");
        expect(result).toBe(`12#{"id":"abc"}`);
        resolve();
      });
    });
  });

  it("should handle message and invoke prehook", async () => {
    await new Promise<void>((resolve) => {
      handleMessage(
        `2#{}`,
        () => {
          expect(true).toBe(false);
        },
        (ctx) => {
          expect(ctx.req.id).toBeUndefined();
          resolve();
        }
      );
    });
  });

  it("should log error when message format is illegal", async () => {
    await new Promise<void>((resolve) => {
      const beforeError = console.error;
      console.error = () => {
        resolve();
        console.error = beforeError;
      };
      handleMessage(`abc`, () => {
        expect(true).toBe(false);
      });
    });
  });

  it("should invoke onError when message format is illegal", async () => {
    await new Promise<void>((resolve) => {
      handleMessage(
        `abc`,
        () => {
          expect(true).toBe(false);
        },
        undefined,
        (err) => {
          expect(err.message).toBe("Error message format");
          resolve();
        }
      );
    });
  });

  it("should return error message when res.error is not empty", async () => {
    await new Promise<void>((resolve) => {
      handleMessage(
        `12#{"id":"abc"}`,
        ({ req, result }) => {
          expect(req.id).toBe("abc");
          expect(result).toBe(`26#{"id":"abc","error":"err"}`);
          resolve();
        },
        (ctx) => {
          ctx.res.setError("err");
        }
      );
    });
  });
});
