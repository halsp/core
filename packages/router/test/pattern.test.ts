import { Request } from "@ipare/core";
import { TestMicroStartup } from "@ipare/testing-micro";
import "./global";

describe("pattern", () => {
  it("should match event pattern when use micro env", async () => {
    const result = await new TestMicroStartup()
      .setContext(new Request().setPath("event:123"))
      .useTestRouter()
      .useRouter()
      .run();
    expect(result.body).toBe("event-pattern-test");
  });

  it("should match message pattern when use micro env", async () => {
    const result = await new TestMicroStartup()
      .setContext(new Request().setPath("message:123"))
      .useTestRouter()
      .useRouter()
      .run();
    expect(result.body).toBe("message-pattern-test");
  });

  it("should match pattern by path", async () => {
    const result = await new TestMicroStartup()
      .setContext(new Request().setPath("path"))
      .useTestRouter()
      .useRouter()
      .run();
    expect(result.body).toBe("pattern-path-test");
  });

  it("should match pattern by path and type", async () => {
    const result = await new TestMicroStartup()
      .setContext(new Request().setPath("path2"))
      .useTestRouter()
      .useRouter()
      .run();
    expect(result.body).toBe("pattern-message-path-test");
  });

  it("should be error if pattern is not exist", async () => {
    const result = await new TestMicroStartup()
      .setContext(new Request().setPath("not-exist"))
      .useTestRouter()
      .useRouter()
      .run();
    expect(result.body).toEqual({
      status: "error",
      message: `Can't find the path: not-exist`,
    });
  });

  it("should match first pattern when use multi patterns", async () => {
    const result = await new TestMicroStartup()
      .setContext(new Request().setPath("multi:123"))
      .use(async (ctx, next) => {
        await next();
        expect(ctx.actionMetadata.methods).toEqual([]);
      })
      .useTestRouter()
      .useRouter()
      .run();
    expect(result.body).toEqual("multi-pattern-test");
  });
});
