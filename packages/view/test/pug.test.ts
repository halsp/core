import { TestStartup } from "sfa";
import "../src";

test("pug", async function () {
  const res = await new TestStartup()
    .useViews("test/views")
    .use(async (ctx) => {
      await ctx.view("pug/test", {
        name: "test pug",
      });
    })
    .run();

  expect(res.getHeader("content-type")).toBe("text/html");
  expect(res.status).toBe(200);
  expect(res.body).toBe("<p>test pug</p>");
});
