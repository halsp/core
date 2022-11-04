import { Request } from "@ipare/core";
import { TestMicroStartup } from "@ipare/testing-micro";
import "./global";

describe("pattern", () => {
  it("should match pattern when use micro env", async () => {
    const result = await new TestMicroStartup()
      .setContext(new Request().setPath("abc:123"))
      .useTestRouter()
      .useRouter()
      .run();
    expect(result.body).toBe("pattern-test");
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
});
