import { Request, Startup } from "@halsp/core";
import "@halsp/http";
import "./utils";

describe("def modules", () => {
  it("should load modules", async () => {
    const result = await new Startup()
      .keepThrow()
      .useHttp()
      .setContext(new Request().setPath("").setMethod("GET"))
      .useTestRouter({
        dir: "test/modules",
      })
      .useRouter()
      .test();

    expect(result.ctx.get("module")).toBe(true);
  });
});

describe("prefix", () => {
  it("should add prefix for modules", async () => {
    const result = await new Startup()
      .keepThrow()
      .useHttp()
      .setContext(new Request().setPath("pre").setMethod("GET"))
      .useTestRouter({
        dir: "test/modules",
      })
      .useRouter()
      .test();

    expect(result.ctx.get("module")).toBe(true);
  });

  it("should add prefix for modules with deep url", async () => {
    const result = await new Startup()
      .keepThrow()
      .useHttp()
      .setContext(new Request().setPath("pre/deep").setMethod("GET"))
      .useTestRouter({
        dir: "test/modules",
      })
      .useRouter()
      .test();

    expect(result.ctx.get("module")).toBe(true);
  });

  it("should add prefix for modules with decorators", async () => {
    const result = await new Startup()
      .keepThrow()
      .useHttp()
      .setContext(new Request().setPath("pre/deep-deco").setMethod("POST"))
      .useTestRouter({
        dir: "test/modules",
      })
      .useRouter()
      .test();

    expect(result.ctx.get("module")).toBe(true);
  });
});
