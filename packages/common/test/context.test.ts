import { Context, Request, Response } from "../src";

describe("req", () => {
  it("should init req", async () => {
    const req = new Request();
    const res = new Response();
    const ctx = new Context(req, res);
    expect(ctx.req).toBe(req);
    expect(ctx.req).toBe(ctx.request);
    expect(req.ctx).toBe(ctx);
  });

  it("should init res", async () => {
    const ctx = new Context();
    expect(ctx.res instanceof Response).toBeTruthy();
    expect(ctx.res).toBe(ctx.response);
    expect(ctx.res).not.toBeUndefined();
    expect(ctx.res.ctx).toBe(ctx);
  });
});
