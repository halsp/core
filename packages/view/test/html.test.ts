import { TestStartup } from "@ipare/testing";
import "../src";

test("html", async () => {
  const ctx = await new TestStartup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      ctx.bag("view", await ctx.view("html/"));
    })
    .run();

  expect(ctx.bag("view")).toBe("html content");
});
