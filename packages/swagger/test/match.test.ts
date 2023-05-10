import { Request, Startup } from "@halsp/core";
import { TEST_ACTION_DIR } from "@halsp/router/dist/constant";
import "@halsp/http";
import "@halsp/testing";
import "../src";
import { SwaggerOptions } from "../src";

declare module "@halsp/core" {
  interface Startup {
    setTestDir(dir: string): this;
  }
}

Startup.prototype.setTestDir = function (dir: string) {
  this[TEST_ACTION_DIR] = dir;
  return this;
};

describe("match path", () => {
  it("should unmatched when path unmatched", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("/test"))
      .useSwagger()
      .setTestDir("test/parser")
      .useRouter()
      .test();

    expect(res.status).toBe(405);
  });

  it("should matched when method is get", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("swagger/index.html").setMethod("get"))
      .useSwagger()
      .setTestDir("test/parser")
      .useRouter()
      .test();

    expect(res.status).toBe(200);
  });

  it("should matched when method is any", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("swagger/index.html").setMethod("get"))
      .useSwagger()
      .setTestDir("test/parser")
      .useRouter()
      .test();

    expect(res.status).toBe(200);
  });

  it("should not matched when method is post", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("swagger").setMethod("post"))
      .useSwagger()
      .setTestDir("test/parser")
      .useRouter()
      .test();

    expect(res.status).toBe(404);
  });

  it("should create doc when extend path is index.json", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("swagger/index.json").setMethod("get"))
      .useSwagger()
      .setTestDir("test/parser")
      .useRouter()
      .test();

    expect(res.status).toBe(200);
  });

  it("should create doc when extend path is /index.json and prefix path is empty", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("/index.json").setMethod("get"))
      .useSwagger({
        path: "",
      })
      .setTestDir("test/parser")
      .useRouter()
      .test();

    expect(res.status).toBe(200);
  });

  it("should return html when extend path is index.html", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("index.html").setMethod("get"))
      .useSwagger({
        path: "",
      })
      .setTestDir("test/parser")
      .useRouter()
      .test();

    expect(res.status).toBe(200);
  });

  it("should create doc when extend path is index.json and prefix path is empty", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("index.json").setMethod("get"))
      .useSwagger({
        path: "",
      })
      .setTestDir("test/parser")
      .useRouter()
      .test();

    expect(res.status).toBe(200);
  });

  it("should not replace body when status is not 200", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("swagger/not-exist").setMethod("get"))
      .useSwagger()
      .use(async (ctx) => {
        ctx.res.badRequest("ab");
      })
      .test();

    expect(res.status).toBe(400);
    expect(res.body).toBe("ab");
  });

  it("should not replace body when body is empay", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("swagger/not-exist").setMethod("get"))
      .useSwagger()
      .use(async (ctx) => {
        ctx.res.ok();
      })
      .test();

    expect(res.status).toBe(200);
    expect(res.body).toBeUndefined();
  });

  it("should not replace body when body is not string", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("swagger/not-exist").setMethod("get"))
      .useSwagger()
      .use(async (ctx) => {
        ctx.res.ok(123);
      })
      .test();

    expect(res.status).toBe(200);
    expect(res.body).toBe(123);
  });

  it("should set default version if there is no package.json", async () => {
    const current = process.cwd();
    process.chdir("../../..");
    try {
      const res = await new Startup()
        .useHttp()
        .setContext(
          new Request().setPath("swagger/index.json").setMethod("get")
        )
        .useSwagger()
        .setTestDir("core/packages/swagger/test/parser")
        .useRouter()
        .test();

      expect(res.body.info.version).toBe("0.0.1");
    } finally {
      process.chdir(current);
    }
  });

  it("should set default version if there is no versin in package.json", async () => {
    const current = process.cwd();
    process.chdir("test/empty-version");
    try {
      const res = await new Startup()
        .useHttp()
        .setContext(
          new Request().setPath("swagger/index.json").setMethod("get")
        )
        .useSwagger()
        .setTestDir("../parser")
        .useRouter()
        .test();

      expect(res.body.info.version).toBe("0.0.1");
    } finally {
      process.chdir(current);
    }
  });
});

describe("redirect", () => {
  function test(
    name: string,
    path: string,
    options: SwaggerOptions | undefined,
    location: string
  ) {
    it(name.replace("$location", location), async () => {
      const res = await new Startup()
        .useHttp()
        .setContext(new Request().setPath(path).setMethod("get"))
        .useSwagger(options)
        .setTestDir("test/parser")
        .useRouter()
        .test();

      expect(res.status).toBe(307);
      expect(res.get("location")).toBe(location);
    });
  }

  test(
    "should redirect to $location when path is empty",
    "",
    {
      path: "",
    },
    "./index.html"
  );

  test(
    "should redirect to $location when path is /",
    "/",
    {
      path: "",
    },
    "./index.html"
  );

  test(
    "should redirect to $location when path is root",
    "swagger",
    undefined,
    "./swagger/index.html"
  );

  test(
    "should redirect to $location when path is swagger/",
    "swagger/",
    undefined,
    "./index.html"
  );

  test(
    "should redirect to $location when path is swagger/abc/",
    "swagger/abc/",
    {
      path: "swagger/abc",
    },
    "./index.html"
  );

  test(
    "should redirect to $location when path is swagger/abc",
    "swagger/abc",
    {
      path: "swagger/abc",
    },
    "./abc/index.html"
  );

  test(
    "should redirect to $location when path is default ant basePath is v3",
    "swagger",
    {
      basePath: "v3",
    },
    "./swagger/index.html"
  );

  test(
    "should redirect to $location when path is empty ant basePath is v3",
    "",
    {
      basePath: "v3",
      path: "",
    },
    "./v3/index.html"
  );

  test(
    "should redirect to $location when path is empty ant basePath is v3",
    "/",
    {
      basePath: "v3",
      path: "",
    },
    "./v3/index.html"
  );
});
