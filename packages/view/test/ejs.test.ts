import { TestStartup } from "sfa";
import "../src";

test("ejs", async function () {
  const res = await new TestStartup()
    .useViews({
      dir: "test/views",
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

test("ejs index", async function () {
  const res = await new TestStartup()
    .useViews({
      dir: "test/views/ejs",
    })
    .use(async (ctx) => {
      await ctx.view("", {
        name: "test ejs",
      });
    })
    .run();

  expect(res.getHeader("content-type")).toBe("text/html");
  expect(res.status).toBe(200);
  expect(res.body).toBe("<p>test ejs</p>");
});
