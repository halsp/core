import { Context, Request } from "@halsp/core";
import { ClientPacket } from "@halsp/micro-common";
import { MicroException, MicroStartup } from "../src";
import { TestStartup } from "./utils";

describe("startup", () => {
  it("should set env", () => {
    process.env.HALSP_ENV = "" as any;
    new TestStartup();
    expect(process.env.HALSP_ENV).toBe("micro");
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
  async function handleMessage<T = object>(
    text: string,
    onSend: (arg: {
      req: Request;
      result: ClientPacket<T>;
    }) => void | Promise<void>,
    prehook?: (ctx: Context) => Promise<void> | void
  ) {
    await new TestClass()["handleMessage"](JSON.parse(text), onSend, prehook);
  }

  it("should handle message and send result", async () => {
    await handleMessage(`{"id":"abc"}`, ({ req, result }) => {
      expect(req.id).toBe("abc");
      expect(result).toEqual({ id: "abc" });
    });
  });

  it("should handle message and invoke prehook", async () => {
    await handleMessage(
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
    let error: any;
    try {
      await handleMessage(`abc`, () => {
        expect(true).toBe(false);
      });
    } catch (err) {
      error = err;
    }
    expect(!!error).toBeTruthy();
  });

  it("should return error message when res.error is not empty", async () => {
    await handleMessage(
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
