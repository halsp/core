import { Startup } from "@halsp/core";
import "@halsp/testing";
import "../src";
import { consolidate } from "../src";

describe("engine", () => {
  it("should render by str engine", async () => {
    await new Startup()
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
          }),
        ).toBe("<p>test ejs</p>");
      })
      .test();
  });

  it("should render by func engine", async () => {
    await new Startup()
      .useView({
        dir: "test/views",
        engines: { ext: "ejs", render: consolidate.ejs },
      })
      .use(async (ctx) => {
        expect(
          await ctx.view("ejs/index.ejs", {
            name: "test ejs",
          }),
        ).toBe("<p>test ejs</p>");
      })
      .test();
  });

  it("should render by file ext when engine is null", async () => {
    await new Startup()
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
          }),
        ).toBe("<p>test ejs</p>");
      })
      .test();
  });
});

describe("pub", () => {
  it("should render with pug engine", async () => {
    const { ctx } = await new Startup()
      .useView({
        dir: "test/views",
      })
      .use(async (ctx) => {
        ctx.set(
          "view",
          await ctx.view("pug/test", {
            name: "test pug",
          }),
        );
      })
      .test();

    expect(ctx.get("view")).toBe("<p>test pug</p>");
  });
});

describe("ejs", () => {
  it("should render with ejs engine", async () => {
    await new Startup()
      .useView({
        dir: "test/views",
      })
      .use(async (ctx) => {
        expect(
          await ctx.view("ejs/index.ejs", {
            name: "test ejs",
          }),
        ).toBe("<p>test ejs</p>");
      })
      .test();
  });

  it("should render index with ejs", async () => {
    await new Startup()
      .useView({
        dir: "test/views/ejs",
      })
      .use(async (ctx) => {
        expect(
          await ctx.view("", {
            name: "test ejs",
          }),
        ).toBe("<p>test ejs</p>");
      })
      .test();
  });
});

describe("html", () => {
  it("should not render html file", async () => {
    const { ctx } = await new Startup()
      .useView({
        dir: "test/views",
      })
      .use(async (ctx) => {
        ctx.set("view", await ctx.view("html/"));
      })
      .test();

    expect(ctx.get("view")).toBe("html content");
  });
});
