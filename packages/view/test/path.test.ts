import { TestStartup } from "@ipare/testing";
import "../src";

test("run multiple", async () => {
  const startup = new TestStartup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      await ctx.view("ejs/index.ejs", {
        name: "test ejs",
      });
    });

  const res1 = await startup.run();
  expect(res1.status).toBe(200);
  expect(res1.body).toBe("<p>test ejs</p>");

  const res2 = await startup.run();
  expect(res2.status).toBe(200);
  expect(res2.body).toBe("<p>test ejs</p>");
});

test("default index", async () => {
  const res = await new TestStartup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      await ctx.view("ejs", {
        name: "test ejs",
      });
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("<p>test ejs</p>");
});

test("without ext", async () => {
  const res = await new TestStartup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      await ctx.view("ejs/index", {
        name: "test ejs",
      });
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("<p>test ejs</p>");
});

test("default dir", async () => {
  const res = await new TestStartup()
    .useView()
    .use(async (ctx) => {
      await ctx.view("ejs/index", {
        name: "test ejs",
      });
    })
    .run();

  expect(res.status).toBe(404);
});

test("null", async () => {
  const res = await new TestStartup()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .useView()
    .use(async (ctx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx.state = null as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ctx.view(null as any, null as any);
    })
    .run();

  expect(res.status).toBe(404);
});
