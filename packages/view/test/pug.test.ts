import { TestStartup } from "@ipare/testing";
import "../src";

test("pug", async () => {
  const { ctx } = await new TestStartup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      ctx.bag(
        "view",
        await ctx.view("pug/test", {
          name: "test pug",
        })
      );
    })
    .run();

  expect(ctx.bag("view")).toBe("<p>test pug</p>");
});
