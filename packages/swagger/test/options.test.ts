import { Request, Response } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../src";
import { TEST_ACTION_DIR } from "@ipare/router/dist/constant";

declare module "@ipare/core" {
  interface Startup {
    setTestDir(dir: string): this;
  }
}

TestStartup.prototype.setTestDir = function (dir: string) {
  this[TEST_ACTION_DIR] = dir;
  return this;
};

function baseExpect(res: Response) {
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("text/html");
  expect((res.body as string).startsWith("<!DOCTYPE html>")).toBeTruthy();
}

test("builder", async () => {
  const res = await new TestStartup()
    .use(async (ctx, next) => {
      await next();
      expect(typeof ctx.swaggerOptions.builder).toBe("function");
    })
    .useSwagger({
      builder: (builder) =>
        builder.addInfo({
          title: "test",
          version: "1.0.1",
        }),
    })
    .setTestDir("test/parser")
    .useRouter()
    .run();
  baseExpect(res);
});

test("other router", async () => {
  const res = await new TestStartup()
    .setRequest(new Request().setPath("/test").setMethod("post"))
    .useSwagger()
    .setTestDir("test/parser")
    .useRouter()
    .run();

  expect(res.status).toBe(200);
});

test("custom html", async () => {
  const res = await new TestStartup()
    .useSwagger({
      customHtml: () => "abc",
    })
    .setTestDir("test/parser")
    .useRouter()
    .run();

  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("text/html");
  expect(res.body).toBe("abc");
});

test("use again", async () => {
  const res = await new TestStartup()
    .useSwagger({})
    .useSwagger({})
    .setTestDir("test/parser")
    .useRouter()
    .run();

  baseExpect(res);
});
