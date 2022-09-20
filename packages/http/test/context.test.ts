import { Context } from "@ipare/core";
import { createContext } from "../src";

describe("context", () => {
  it("default instance", async () => {
    const ctx = new Context();
    expect(ctx.req).toBeUndefined();
    expect(ctx.res).toBeUndefined();
  });

  it("should set req", async () => {
    const ctx = createContext();
    expect(ctx).toBe(ctx.req.ctx);
  });

  it("should set res", async () => {
    const ctx = createContext();
    expect(ctx).toBe(ctx.res.ctx);
  });
});
