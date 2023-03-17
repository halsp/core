import { MicroContext, MicroException } from "../src";

describe("exception", () => {
  it("should trans to plain object", async () => {
    const ex = new MicroException("err");
    expect(ex.message).toBe("err");
  });

  it("should set string error from MicroException.message ", () => {
    const ctx = new MicroContext();
    ctx.catchError(new MicroException("abc"));
    expect(ctx.res.error).toBe("abc");
  });

  it("should set string error from string ", () => {
    const ctx = new MicroContext();
    ctx.catchError("abc");
    expect(ctx.res.error).toBe("abc");
  });

  it("should set string error from Error", () => {
    const ctx = new MicroContext();
    ctx.catchError(new Error("abc"));
    expect(ctx.res.error).toBe("abc");
  });

  it("should set string error from object with message property", () => {
    const ctx = new MicroContext();
    ctx.catchError({
      message: "abc",
    });
    expect(ctx.res.error).toBe("abc");
  });

  it("should set empty error from empty object", () => {
    const ctx = new MicroContext();
    ctx.catchError({});
    expect(ctx.res.error).toBe("");
  });

  it("should set empty error from null", () => {
    const ctx = new MicroContext();
    ctx.catchError(null);
    expect(ctx.res.error).toBe("");
  });
});
