import "../src";
import "@halsp/testing";
import { Startup } from "@halsp/core";

describe("call", () => {
  it("should set body when 'res.view' called", async () => {
    const { ctx } = await new Startup()
      .useView({
        dir: "test/views",
      })
      .use(async (ctx) => {
        await ctx.res.view("ejs", {
          name: "test ejs",
        });
      })
      .test();

    expect(ctx.res.body).toBe("<p>test ejs</p>");
  });

  it("should not set body when render empty string", async () => {
    const { ctx } = await new Startup()
      .useView({
        dir: "test/views",
      })
      .use(async (ctx) => {
        await ctx.res.view("empty");
      })
      .test();

    expect(ctx.res.body).toBeUndefined();
  });

  it("should call res.ok and set content-type when HALSP_ENV = http", async () => {
    let okCalled = false;
    let setCalled = false;

    const beforeEnv = process.env.HALSP_ENV;
    process.env.HALSP_ENV = "http";
    await new Startup()
      .useView({
        dir: "test/views",
      })
      .use(async (ctx) => {
        ctx.res["ok"] = () => {
          okCalled = true;
        };
        ctx.res["set"] = () => {
          setCalled = true;
        };
        await ctx.res.view("ejs", {
          name: "test ejs",
        });
      })
      .test();
    process.env.HALSP_ENV = beforeEnv;

    expect(okCalled).toBeTruthy();
    expect(setCalled).toBeTruthy();
  });
});
