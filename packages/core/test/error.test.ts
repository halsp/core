import { IpareException, isExceptionMessage } from "../src";
import { TestStartup } from "./test-startup";

describe("error", () => {
  it("should push error stack when throw error", async () => {
    const { ctx } = await new TestStartup()
      .use(async () => {
        throw new IpareException();
      })
      .run();
    expect(ctx.errorStack.length).toBe(1);
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
