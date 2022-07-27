import { Request, Response, TestStartup } from "@ipare/core";
import "../src";

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
    .useRouter({
      dir: "test/parser",
    })
    .run();
  baseExpect(res);
});

test("other router", async () => {
  const res = await new TestStartup(
    new Request().setPath("/test").setMethod("post")
  )
    .useSwagger()
    .useRouter({
      dir: "test/parser",
    })
    .run();

  expect(res.status).toBe(200);
});

test("custom html", async () => {
  const res = await new TestStartup()
    .useSwagger({
      customHtml: () => "abc",
    })
    .useRouter({
      dir: "test/parser",
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("text/html");
  expect(res.body).toBe("abc");
});

test("use again", async () => {
  const res = await new TestStartup()
    .useSwagger({})
    .useSwagger({})
    .useRouter({
      dir: "test/parser",
    })
    .run();

  baseExpect(res);
});
