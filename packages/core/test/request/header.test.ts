import { SimpleStartup } from "../../src";

test("router test", async function () {
  const result = await new SimpleStartup()
    .use(async (ctx) => {
      ctx.res.status = 200;
      ctx.res.headers["custom-header"] = "aaa";
    })
    .run();

  expect(result.status).toBe(200);
  expect(result.headers["custom-header"]).toBe("aaa");
});
