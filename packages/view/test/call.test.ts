import "../src";
import { TestStartup } from "@ipare/testing";

describe("call", () => {
  it("should set body when 'res.view' called", async () => {
    const { ctx } = await new TestStartup()
      .useView({
        dir: "test/views",
      })
      .use(async (ctx) => {
        await ctx.res.view("ejs", {
          name: "test ejs",
        });
      })
      .run();

    expect(ctx.res.body).toBe("<p>test ejs</p>");
  });

  it("should not set body when render empty string", async () => {
    const { ctx } = await new TestStartup()
      .useView({
        dir: "test/views",
      })
      .use(async (ctx) => {
        await ctx.res.view("empty");
      })
      .run();

    expect(ctx.res.body).toBeUndefined();
  });

  it("should call res.ok and set content-type when IPARE_ENV = http", async () => {
    let okCalled = false;
    let setCalled = false;

    const beforeEnv = process.env.IPARE_ENV;
    process.env.IPARE_ENV = "http";
    await new TestStartup()
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
      .run();
    process.env.IPARE_ENV = beforeEnv;

    expect(okCalled).toBeTruthy();
    expect(setCalled).toBeTruthy();
  });
});
