import { TestStartup } from "@ipare/testing";
import "../src";

test("ejs", async () => {
  await new TestStartup()
    .useView({
      dir: "test/views",
    })
    .use(async (ctx) => {
      expect(
        await ctx.view("ejs/index.ejs", {
          name: "test ejs",
        })
      ).toBe("<p>test ejs</p>");
    })
    .run();
});

test("ejs index", async () => {
  await new TestStartup()
    .useView({
      dir: "test/views/ejs",
    })
    .use(async (ctx) => {
      expect(
        await ctx.view("", {
          name: "test ejs",
        })
      ).toBe("<p>test ejs</p>");
    })
    .run();
});
