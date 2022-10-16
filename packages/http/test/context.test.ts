import { Context } from "@ipare/core";
describe("context", () => {
  it("default instance", async () => {
    const ctx = new Context();
    expect(ctx.req).not.toBeUndefined();
    expect(ctx.res).not.toBeUndefined();
  });

  it("should set req", async () => {
    const ctx = new Context();
    expect(ctx).toBe(ctx.req.ctx);
  });

  it("should set res", async () => {
    const ctx = new Context();
    expect(ctx).toBe(ctx.res.ctx);
  });
});
