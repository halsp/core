import { Request } from "@ipare/core";
import { TestMicroStartup } from "@ipare/testing-micro";
import "./global";

describe("pattern", () => {
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

  it("should match all patterns when use multi patterns", async () => {
    async function test(pattern: string) {
      const result = await new TestMicroStartup()
        .setContext(new Request().setPath(pattern))
        .use(async (ctx, next) => {
          await next();
          expect(ctx.actionMetadata.methods).toEqual([]);
        })
        .useTestRouter()
        .useRouter()
        .run();
      expect(result.body).toEqual("multi-pattern-test");
    }
    await test("multi:123");
    await test("multi:456");
  });
});
