import { SimpleStartup } from "../../src";

test("simple startup", async function () {
  const req = new SimpleStartup();

  expect(req.ctx.mds.length).toBe(0);

  req.use(async (ctx) => {
    ctx.res.setHeader("h1", "1");
  });

  expect(req.ctx.mds.length).toBeGreaterThan(0);
});
