import { SimpleStartup, Request } from "../../src";

test("request setHeader", async function () {
  const startup = new SimpleStartup(
    new Request().setHeader("h1", "1").setHeader("h2", "2").setHeader("h3", "3")
  );

  expectHeaders(startup.ctx.req.headers);
});

test("request setHeaders", async function () {
  const startup = new SimpleStartup(
    new Request().setHeaders({
      h1: "1",
      h2: "2",
      h3: "3",
    })
  );
  expectHeaders(startup.ctx.req.headers);
});

function expectHeaders(headers: Record<string, string | string[] | undefined>) {
  expect(headers.h1).toBe("1");
  expect(headers.h2).toBe("2");
  expect(headers.h3).toBe("3");
  expect(headers.h4).toBe(undefined);
}

test("custom header", async function () {
  const result = await new SimpleStartup(new Request())
    .use(async (ctx) => {
      ctx.res.status = 200;
      ctx.res.headers["custom-header"] = "aaa";
    })
    .run();

  expect(result.status).toBe(200);
  expect(result.headers["custom-header"]).toBe("aaa");
});
