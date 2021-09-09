import { TestStartup } from "sfa";
import "../src";
import { consolidate } from "../src";

test("str engine", async function () {
  const res = await new TestStartup()
    .useViews("test/views", undefined, [
      { ext: "ejs", render: "ejs" },
      { ext: "custom", render: "ejs" },
    ])
    .use(async (ctx) => {
      await ctx.view("ejs/index.ejs", {
        name: "test ejs",
      });
    })
    .run();

  expect(res.getHeader("content-type")).toBe("text/html");
  expect(res.status).toBe(200);
  expect(res.body).toBe("<p>test ejs</p>");
});

test("func engine", async function () {
  const res = await new TestStartup()
    .useViews("test/views", undefined, [
      { ext: "ejs", render: consolidate.ejs },
    ])
    .use(async (ctx) => {
      await ctx.view("ejs/index.ejs", {
        name: "test ejs",
      });
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("<p>test ejs</p>");
});

test("empty engine", async function () {
  const res = await new TestStartup()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .useViews("test/views", null as any, null as any)
    .use(async (ctx) => {
      await ctx.view("ejs/index.ejs", {
        name: "test ejs",
      });
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("<p>test ejs</p>");
});