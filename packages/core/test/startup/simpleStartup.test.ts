import { SimpleStartup, Startup } from "../../src";

test("simple startup", async function () {
  const req = new SimpleStartup();

  expect(req instanceof Startup).toBeTruthy();
  expect(req.ctx).not.toBeUndefined();
  expect(req.ctx.req).not.toBeUndefined();
  expect(req.ctx.res).not.toBeUndefined();
  expect(req.ctx.mds).not.toBeUndefined();
});
