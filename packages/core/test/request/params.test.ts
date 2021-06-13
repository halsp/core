import { TestStartup, Request } from "../../src";

test("request setParam", async function () {
  const req = new Request()
    .setParam("p1", "1")
    .setParam("p2", "2")
    .setParam("p3", "3");

  expectParams(req.params);
});

test("request setParams", async function () {
  const req = new Request().setParams({
    p1: "1",
    p2: "2",
    p3: "3",
  });
  expectParams(req.params);
});

function expectParams(params: Record<string, string | string[] | undefined>) {
  expect(params.p1).toBe("1");
  expect(params.p2).toBe("2");
  expect(params.p3).toBe("3");
  expect(params.p4).toBe(undefined);
}

test("custom param", async function () {
  const result = await new TestStartup(new Request())
    .use(async (ctx) => {
      ctx.res.status = 200;
      ctx.res.setHeader("custom-param", "aaa");
    })
    .run();

  expect(result.status).toBe(200);
  expect(result.getHeader("custom-param")).toBe("aaa");
});
