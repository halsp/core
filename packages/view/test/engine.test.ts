import { TestStartup } from "sfa";
import "../src";
import { consolidate } from "../src";
import { HttpContext } from "sfa";

test("str engine", async function () {
  const res = await new TestStartup()
    .useViews("test/views", {
      engines: { ejs: "ejs" },
    })
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HttpContext.prototype.view = undefined as any;
  const res = await new TestStartup()
    .useViews("test/views", {
      engines: { ejs: consolidate.ejs },
    })
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HttpContext.prototype.view = undefined as any;
  const res = await new TestStartup()
    .useViews("test/views", {
      engines: undefined,
    })
    .use(async (ctx) => {
      await ctx.view("ejs/index.ejs", {
        name: "test ejs",
      });
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("<p>test ejs</p>");
});
