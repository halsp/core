import { HookType, Request, Startup } from "@halsp/core";
import "@halsp/http";
import "./utils";
import { Action } from "../src";

describe("def modules", () => {
  it("should load modules", async () => {
    const { ctx } = await new Startup()
      .keepThrow()
      .useHttp()
      .setContext(new Request().setPath("").setMethod("GET"))
      .useTestRouter({
        dir: "test/modules",
      })
      .useRouter()
      .test();

    expect(ctx.get("module")).toBe(true);
  });
});

describe("prefix", () => {
  it("should add prefix for modules", async () => {
    const { ctx } = await new Startup()
      .keepThrow()
      .useHttp()
      .setContext(new Request().setPath("pre").setMethod("GET"))
      .useTestRouter({
        dir: "test/modules",
      })
      .useRouter()
      .test();

    expect(ctx.get("module")).toBe(true);
  });

  it("should add prefix for modules with deep url", async () => {
    const { ctx } = await new Startup()
      .keepThrow()
      .useHttp()
      .setContext(new Request().setPath("pre/deep").setMethod("GET"))
      .useTestRouter({
        dir: "test/modules",
      })
      .useRouter()
      .test();

    expect(ctx.get("module")).toBe(true);
  });

  it("should add prefix for modules with decorators", async () => {
    const { ctx } = await new Startup()
      .keepThrow()
      .useHttp()
      .setContext(new Request().setPath("pre/deep-deco").setMethod("POST"))
      .useTestRouter({
        dir: "test/modules",
      })
      .useRouter()
      .test();

    expect(ctx.get("module")).toBe(true);
  });
});

describe("decorators", () => {
  it("should add decorator for actions", async () => {
    const { ctx } = await new Startup()
      .keepThrow()
      .useHttp()
      .setContext(new Request().setPath("deco").setMethod("GET"))
      .hook(HookType.AfterInvoke, (ctx, md) => {
        if (!(md instanceof Action)) {
          return undefined;
        }

        console.log("aaaaaaaaa", md);
        ctx.set("test", md["moduleTest"]);
      })
      .useTestRouter({
        dir: "test/modules",
      })
      .useRouter()
      .test();

    expect(ctx.get("module")).toBe(true);
    expect(ctx.get("test")).toBe(true);
  });
});
