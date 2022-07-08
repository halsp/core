import { HttpContext, Request, Response, Startup } from "../../src";

class CustomStartup extends Startup {
  async run(): Promise<Response> {
    return await super.invoke(new HttpContext(new Request()));
  }
}

test("custom result handler", async () => {
  const res = await new CustomStartup()
    .use((ctx) => {
      ctx.ok({
        msg: "ok",
      });
    })
    .run();

  expect(res.body).toEqual({
    msg: "ok",
  });
  expect(res.status).toBe(200);
});
