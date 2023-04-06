import { HalspException, isExceptionMessage } from "../src";
import { TestStartup } from "./test-startup";

describe("error", () => {
  it("should push error stack when throw error", async () => {
    const { ctx } = await new TestStartup()
      .use(async () => {
        throw new Error();
      })
      .run();
    expect(ctx.errorStack.length).toBe(1);
  });

  it("should breakthrough when set error.breakthrough = true", async () => {
    const { ctx } = await new TestStartup()
      .use(async (ctx, next) => {
        await next();
        ctx.set("test", true);
      })
      .use(async () => {
        throw new HalspException().setBreakthrough();
      })
      .run();

    expect(ctx.errorStack.length).toBe(1);
    expect(ctx.get("test")).toBeUndefined();
  });

  it("should not breakthrough when set error.breakthrough = false", async () => {
    const { ctx } = await new TestStartup()
      .use(async (ctx, next) => {
        await next();
        ctx.set("test", true);
      })
      .use(async () => {
        throw new HalspException().setBreakthrough(false);
      })
      .run();

    expect(ctx.errorStack.length).toBe(1);
    expect(ctx.get("test")).toBeTruthy();
  });

  it("should set message with string", () => {
    const exception = new HalspException("abc");
    expect(exception.message).toBe("abc");
  });

  it("should set message with string", () => {
    const exception = new HalspException("abc");
    expect(exception.message).toBe("abc");
  });

  it("should set message with error", () => {
    const err = new Error("abc");
    const exception = new HalspException(err);
    expect(exception.message).toBe("abc");
  });

  it("should set message = '' with empty object", () => {
    const err = {} as any;
    const exception = new HalspException(err);
    expect(exception.message).toBe("");
  });
});

describe("isExceptionMessage", () => {
  it("should be false when param is undefined", () => {
    expect(isExceptionMessage(undefined)).toBeFalsy();
  });

  it("should be false when param is null", () => {
    expect(isExceptionMessage(undefined)).toBeFalsy();
  });

  it("should be false when param is empty object", () => {
    expect(isExceptionMessage({})).toBeFalsy();
  });

  it("should be false when param is object with empty property message", () => {
    expect(
      isExceptionMessage({
        message: "",
      })
    ).toBeFalsy();
  });

  it("should be true when param is object with property message", () => {
    expect(
      isExceptionMessage({
        message: "abc",
      })
    ).toBeTruthy();
  });

  it("should be true when param is string", () => {
    expect(isExceptionMessage("abc")).toBeTruthy();
  });
});
