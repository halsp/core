import { Context } from "../../src";
import { TestStartup } from "../test-startup";

test("simple startup", async () => {
  let context!: Context;
  await new TestStartup()
    .use(async (ctx) => {
      context = ctx;
    })
    .run();

  expect(context).not.toBeUndefined();
  expect(context.req).not.toBeUndefined();
  expect(context.res).not.toBeUndefined();
});

test("without md", async () => {
  const res = await new TestStartup().run();

  expect(res).not.toBeUndefined();
});

test("requst/response ctx", async () => {
  const startup = new TestStartup().use((ctx) => {
    expect(ctx).toBe(ctx.res.ctx);
    expect(ctx).toBe(ctx.req.ctx);
    expect(ctx.startup).toBe(startup);
    ctx.ok();
  });
  const res = await startup.run();

  expect(res.status).toBe(200);
});
