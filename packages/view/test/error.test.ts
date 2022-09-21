import { TestStartup } from "@ipare/testing";
import "../src";

test("dir is not exist", async () => {
  await new TestStartup()
    .useView({
      dir: "test/1views",
    })
    .use(async (ctx) => {
      expect(await ctx.view("")).toBeUndefined();
    })
    .run();
});

test("dir is not exist", async () => {
  await new TestStartup()
    .useView({
      dir: "test",
    })
    .use(async (ctx) => {
      expect(await ctx.view("")).toBeUndefined();
    })
    .run();
});

test("engines is not exist", async () => {
  await new TestStartup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      expect(await ctx.view("error/engine")).toBeUndefined();
    })
    .run();
});

test("error path", async () => {
  await new TestStartup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      expect(await ctx.view("error/path.dir/index")).toBeUndefined();
    })
    .run();
});
