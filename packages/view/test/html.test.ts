import { TestStartup } from "sfa";
import "../src";

test("html", async function () {
  const res = await new TestStartup()
    .useViews({
      dir: "test/views",
    })
    .use(async (ctx) => {
      await ctx.view("html/");
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("html content");
  expect(res.getHeader("content-type")).toBe("text/html");
});
