import { Context } from "@halsp/core";
import { MicroException } from "../src";
import { initCatchError, initContext } from "../src/context";

beforeAll(() => {
  initContext();
});

describe("exception", () => {
  it("should trans to plain object", async () => {
    const ex = new MicroException("err");
    expect(ex.message).toBe("err");
  });

  it("should set string error from MicroException.message ", () => {
    const ctx = new Context();
    initCatchError(ctx);
    ctx.catchError(new MicroException("abc"));
    expect(ctx.res.error).toBe("abc");
  });

  it("should set string error from string ", () => {
    const ctx = new Context();
    initCatchError(ctx);
    ctx.catchError("abc");
    expect(ctx.res.error).toBe("abc");
  });

  it("should set string error from Error", () => {
    const ctx = new Context();
    initCatchError(ctx);
    ctx.catchError(new Error("abc"));
    expect(ctx.res.error).toBe("abc");
  });

  it("should set string error from object with message property", () => {
    const ctx = new Context();
    initCatchError(ctx);
    ctx.catchError({
      message: "abc",
    });
    expect(ctx.res.error).toBe("abc");
  });

  it("should set empty error from empty object", () => {
    const ctx = new Context();
    initCatchError(ctx);
    ctx.catchError({});
    expect(ctx.res.error).toBe("");
  });

  it("should set empty error from null", () => {
    const ctx = new Context();
    initCatchError(ctx);
    ctx.catchError(null);
    expect(ctx.res.error).toBe("");
  });
});
