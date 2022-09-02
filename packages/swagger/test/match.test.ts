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

  it("should not matched when method is post", async () => {
    const res = await new TestStartup()
      .setRequest(new Request().setPath("swagger").setMethod("post"))
      .useSwagger()
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(404);
  });

  it("should create doc when extend path is index.json", async () => {
    const res = await new TestStartup()
      .setRequest(new Request().setPath("swagger/index.json").setMethod("get"))
      .useSwagger()
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
  });

  it("should create doc when extend path is /index.json and prefix path is empty", async () => {
    const res = await new TestStartup()
      .setRequest(new Request().setPath("/index.json").setMethod("get"))
      .useSwagger({
        path: "",
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
  });

  it("should return html when extend path is index.html", async () => {
    const res = await new TestStartup()
      .setRequest(new Request().setPath("index.html").setMethod("get"))
      .useSwagger({
        path: "",
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
  });

  it("should create doc when extend path is index.json and prefix path is empty", async () => {
    const res = await new TestStartup()
      .setRequest(new Request().setPath("index.json").setMethod("get"))
      .useSwagger({
        path: "",
      })
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(res.status).toBe(200);
  });

  it("should replace default json", async () => {
    const res = await new TestStartup()
      .setRequest(
        new Request().setPath("swagger/swagger-initializer.js").setMethod("get")
      )
      .useSwagger()
      .setTestDir("test/parser")
      .useRouter()
      .run();

    expect(
      (res.body as string).includes(
        "https://petstore.swagger.io/v2/swagger.json"
      )
    ).toBeFalsy();
  });

  it("should not replace body when status is not 200", async () => {
    const res = await new TestStartup()
      .setRequest(new Request().setPath("swagger/not-exist").setMethod("get"))
      .useSwagger()
      .use(async (ctx) => {
        ctx.badRequest("ab");
      })
      .run();

    expect(res.status).toBe(400);
    expect(res.body).toBe("ab");
  });

  it("should not replace body when body is empay", async () => {
    const res = await new TestStartup()
      .setRequest(new Request().setPath("swagger/not-exist").setMethod("get"))
      .useSwagger()
      .use(async (ctx) => {
        ctx.ok();
      })
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toBeUndefined();
  });

  it("should not replace body when body is not string", async () => {
    const res = await new TestStartup()
      .setRequest(new Request().setPath("swagger/not-exist").setMethod("get"))
      .useSwagger()
      .use(async (ctx) => {
        ctx.ok(123);
      })
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toBe(123);
  });

  it("should set default version if there is no package.json", async () => {
    const current = process.cwd();
    process.chdir("../../..");
    try {
      const res = await new TestStartup()
        .setRequest(
          new Request().setPath("swagger/index.json").setMethod("get")
        )
        .useSwagger()
        .setTestDir("ipare/packages/swagger/test/parser")
        .useRouter()
        .run();

      expect(res.body.info.version).toBe("0.0.1");
    } finally {
      process.chdir(current);
    }
  });

  it("should set default version if there is no versin in package.json", async () => {
    const current = process.cwd();
    process.chdir("test/empty-version");
    try {
      const res = await new TestStartup()
        .setRequest(
          new Request().setPath("swagger/index.json").setMethod("get")
        )
        .useSwagger()
        .setTestDir("../parser")
        .useRouter()
        .run();

      expect(res.body.info.version).toBe("0.0.1");
    } finally {
      process.chdir(current);
    }
  });
});
