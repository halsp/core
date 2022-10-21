import { IpareException } from "../src";
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
        ctx.bag("test", true);
      })
      .use(async () => {
        throw new IpareException().setBreakthrough();
      })
      .run();

    expect(ctx.errorStack.length).toBe(1);
    expect(ctx.bag("test")).toBeUndefined();
  });

  it("should not breakthrough when set error.breakthrough = false", async () => {
    const { ctx } = await new TestStartup()
      .use(async (ctx, next) => {
        await next();
        ctx.bag("test", true);
      })
      .use(async () => {
        throw new IpareException().setBreakthrough(false);
      })
      .run();

    expect(ctx.errorStack.length).toBe(1);
    expect(ctx.bag("test")).toBeTruthy();
  });

  it("should set message with string", () => {
    const exception = new IpareException("abc");
    expect(exception.message).toBe("abc");
  });

  it("should set message with string", () => {
    const exception = new IpareException("abc");
    expect(exception.message).toBe("abc");
  });

  it("should set message with error", () => {
    const err = new Error("abc");
    const exception = new IpareException(err);
    expect(exception.message).toBe("abc");
  });

  it("should set message = '' with empty object", () => {
    const err = {} as any;
    const exception = new IpareException(err);
    expect(exception.message).toBe("");
  });
});
