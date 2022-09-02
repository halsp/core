import { Request } from "@ipare/core";
import { TEST_ACTION_DIR } from "@ipare/router/dist/constant";
import { TestStartup } from "@ipare/testing";
import "../src";

declare module "@ipare/core" {
  interface Startup {
    setTestDir(dir: string): this;
  }
}

TestStartup.prototype.setTestDir = function (dir: string) {
  this[TEST_ACTION_DIR] = dir;
  return this;
};

describe("match path", () => {
  it("should unmatched when path unmatched", async () => {
    const res = await new TestStartup()
      .setRequest(new Request().setPath("/test"))
      .useSwagger()
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(405);
  });

  it("should matched when method is get", async () => {
    const res = await new TestStartup()
      .setRequest(new Request().setPath("swagger").setMethod("get"))
      .useSwagger()
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
  });

  it("should matched when method is any", async () => {
    const res = await new TestStartup()
      .setRequest(new Request().setPath("swagger").setMethod("get"))
      .useSwagger()
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
  });
});
