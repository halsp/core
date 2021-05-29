import { Startup } from "../src/index";
import Request from "../src/Request";


test("router test", async function () {
  const result = await new Startup(new Request())
    .use(async (ctx) => {
      ctx.res.status = 200;
      ctx.res.headers["custom-header"] = "aaa";
    })
    .invoke();

  expect(result.status).toBe(200);
  expect(result.headers["custom-header"]).toBe("aaa");
});
