import { HttpContext, Request, SfaResponse, Startup } from "../../src";

class CustomStartup extends Startup {
  async run(): Promise<SfaResponse> {
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
