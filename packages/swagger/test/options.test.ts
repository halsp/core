import { HttpMethod, Request, Response } from "@ipare/core";
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
  expect(
    (res.body as string).startsWith(
      "<!-- HTML for static distribution bundle build -->"
    )
  ).toBeTruthy();
}

test("builder", async () => {
  const res = await new TestStartup()
    .setRequest(
      new Request().setMethod(HttpMethod.get).setPath("swagger/index.html")
    )
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

test("use again", async () => {
  const res = await new TestStartup()
    .setRequest(
      new Request().setMethod(HttpMethod.get).setPath("swagger/index.html")
    )
    .useSwagger({})
    .useSwagger({})
    .setTestDir("test/parser")
    .useRouter()
    .run();

  baseExpect(res);
});
