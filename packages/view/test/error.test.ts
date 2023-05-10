import { Startup } from "@halsp/core";
import "@halsp/testing";
import "../src";

test("dir is not exist", async () => {
  await new Startup()
    .useView({
      dir: "test/1views",
    })
    .use(async (ctx) => {
      expect(await ctx.view("")).toBeUndefined();
    })
    .test();
});

test("dir is not exist", async () => {
  await new Startup()
    .useView({
      dir: "test",
    })
    .use(async (ctx) => {
      expect(await ctx.view("")).toBeUndefined();
    })
    .test();
});

test("engines is not exist", async () => {
  await new Startup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      expect(await ctx.view("error/engine")).toBeUndefined();
    })
    .test();
});

test("error path", async () => {
  await new Startup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      expect(await ctx.view("error/path.dir/index")).toBeUndefined();
    })
    .test();
});
