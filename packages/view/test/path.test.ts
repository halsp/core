import { TestStartup } from "@ipare/testing";
import "../src";

test("run multiple", async () => {
  const startup = new TestStartup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      ctx.set(
        "view",
        await ctx.view("ejs/index.ejs", {
          name: "test ejs",
        })
      );
    });

  const { ctx: ctx1 } = await startup.run();
  expect(ctx1.get("view")).toBe("<p>test ejs</p>");

  const { ctx: ctx2 } = await startup.run();
  expect(ctx2.get("view")).toBe("<p>test ejs</p>");
});

test("default index", async () => {
  const { ctx } = await new TestStartup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      ctx.set(
        "view",
        await ctx.view("ejs", {
          name: "test ejs",
        })
      );
    })
    .run();

  expect(ctx.get("view")).toBe("<p>test ejs</p>");
});

test("without ext", async () => {
  const { ctx } = await new TestStartup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      ctx.set(
        "view",
        await ctx.view("ejs/index", {
          name: "test ejs",
        })
      );
    })
    .run();

  expect(ctx.get("view")).toBe("<p>test ejs</p>");
});

test("default dir", async () => {
  const { ctx } = await new TestStartup()
    .useView()
    .use(async (ctx) => {
      ctx.set(
        "view",
        await ctx.view("ejs/index", {
          name: "test ejs",
        })
      );
    })
    .run();

  expect(ctx.get("view")).toBeUndefined();
});

test("null", async () => {
  const { ctx } = await new TestStartup()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .useView()
    .use(async (ctx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx.state = null as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx.set("view", await ctx.view(null as any, null as any));
    })
    .run();

  expect(ctx.get("view")).toBeUndefined();
});
