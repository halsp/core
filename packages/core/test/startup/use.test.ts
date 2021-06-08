import { SimpleStartup } from "../../src";

test("simple startup", async function () {
  const req = new SimpleStartup();

  expect(req.ctx.mds.length).toBe(0);

  req.use(async (ctx) => {
    ctx.res.setHeader("h1", "1");
  });

  expect(req.ctx.mds.length).toBeGreaterThan(0);
});

test("null error build 1", async function () {
  const startup = new SimpleStartup();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    startup.use(null as any);
  } catch (err) {
    expect(true).toBe(true);
    return;
  }
  expect(true).toBe(false);
});

test("null error build 2", async function () {
  const startup = new SimpleStartup();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  startup.use(() => null as any);
  try {
    await startup.run();
  } catch (err) {
    expect(true).toBe(true);
    return;
  }
  expect(true).toBe(false);
});
