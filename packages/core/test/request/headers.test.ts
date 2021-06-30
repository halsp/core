import { TestStartup, Request } from "../../src";
import { HeadersDict } from "../../src/types";

test("request setHeader", async function () {
  const req = new Request()
    .setHeader("h1", "1")
    .setHeader("h2", "2")
    .setHeader("h3", "3");

  expectHeaders(req.headers);
});

test("request setHeaders", async function () {
  const req = new Request().setHeaders({
    h1: "1",
    h2: "2",
    h3: "3",
  });
  expectHeaders(req.headers);
});

function expectHeaders(headers: HeadersDict) {
  expect(headers.h1).toBe("1");
  expect(headers.h2).toBe("2");
  expect(headers.h3).toBe("3");
  expect(headers.h4).toBe(undefined);
}

test("custom header", async function () {
  const result = await new TestStartup()
    .use(async (ctx) => {
      ctx.res.status = 200;
      ctx.res.setHeader("custom-header", "aaa");
    })
    .run();

  expect(result.status).toBe(200);
  expect(result.getHeader("custom-header")).toBe("aaa");
});
