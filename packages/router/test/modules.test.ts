import { HookType, Request, Startup } from "@halsp/core";
import "@halsp/http";
import "./utils";
import { Action } from "../src";
import { HALSP_ROUTER_MODULE } from "../src/constant";
import { isModule } from "../src/map/module";

describe("def modules", () => {
  it("should load modules", async () => {
    const { ctx } = await new Startup()
      .keepThrow()
      .useHttp()
      .setContext(new Request().setPath("").setMethod("GET"))
      .useTestRouter({
        dir: "test/modules",
        isModule: true,
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
        isModule: true,
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
        isModule: true,
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
        isModule: true,
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

        ctx.set("test", md["moduleTest"]);
      })
      .useTestRouter({
        dir: "test/modules",
        isModule: true,
      })
      .useRouter()
      .test();

    expect(ctx.get("module")).toBe(true);
    expect(ctx.get("test")).toBe(true);
  });
});

describe("isModule", () => {
  it("should be true when env.HALSP_ROUTER_MODULE is true", async () => {
    process.env[HALSP_ROUTER_MODULE] = "true";

    expect(isModule("")).toBeTruthy();
    expect(isModule("actions")).toBeTruthy();
    expect(isModule("modules")).toBeTruthy();
  });

  it("should be false when env.HALSP_ROUTER_MODULE is false", async () => {
    process.env[HALSP_ROUTER_MODULE] = "false";

    expect(isModule("")).toBeFalsy();
    expect(isModule("actions")).toBeFalsy();
    expect(isModule("modules")).toBeFalsy();
  });

  it("should be true when dir = modules", async () => {
    delete process.env[HALSP_ROUTER_MODULE];

    expect(isModule("modules")).toBeTruthy();
  });

  it("should be false when dir = actions or others", async () => {
    delete process.env[HALSP_ROUTER_MODULE];

    expect(isModule("actions")).toBeFalsy();
    expect(isModule("others")).toBeFalsy();
  });
});
