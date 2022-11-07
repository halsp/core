import { Request, Response } from "@ipare/core";
import { TestStartup } from "./utils";

beforeAll(() => {
  new TestStartup();
});

describe("context", () => {
  it("should set req.id", () => {
    expect(new Request().id).toBe("");
    expect(new Request().setId("abc").id).toBe("abc");
    expect(new Request().setId(undefined as any).id).toBeUndefined();
  });

  it("should set req.error", () => {
    expect(new Response().error).toBeUndefined();
    expect(new Response().setError("err").error).toBe("err");
    expect(new Response().setError(undefined as any).error).toBeUndefined();
  });
});
