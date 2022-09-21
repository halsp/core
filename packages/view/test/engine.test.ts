import { TestStartup } from "@ipare/testing";
import "../src";
import { consolidate } from "../src";

test("str engine", async () => {
  await new TestStartup()
    .useView({
      dir: "test/views",
      engines: [
        { ext: "ejs", render: "ejs" },
        { ext: "custom", render: "ejs" },
      ],
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

test("func engine", async () => {
  await new TestStartup()
    .useView({
      dir: "test/views",
      engines: { ext: "ejs", render: consolidate.ejs },
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

test("empty engine", async () => {
  await new TestStartup()
    .useView({
      dir: "test/views",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      engines: null as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: null as any,
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
