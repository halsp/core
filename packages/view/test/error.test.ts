import { TestStartup } from "@ipare/core";
import "../src";

test("dir is not exist", async () => {
  const res = await new TestStartup()
    .useView({
      dir: "test/1views",
    })
    .use(async (ctx) => {
      await ctx.view("");
    })
    .run();

  expect(res.status).toBe(404);
});

test("dir is not exist", async () => {
  const res = await new TestStartup()
    .useView({
      dir: "test",
    })
    .use(async (ctx) => {
      await ctx.view("");
    })
    .run();

  expect(res.status).toBe(404);
});

test("engines is not exist", async () => {
  const res = await new TestStartup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      await ctx.view("error/engine");
    })
    .run();

  expect(res.status).toBe(404);
});

test("error path", async () => {
  const res = await new TestStartup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      await ctx.view("error/path.dir/index");
    })
    .run();

  expect(res.status).toBe(404);
});
