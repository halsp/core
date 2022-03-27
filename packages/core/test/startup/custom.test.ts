import { HttpContext, SfaRequest, SfaResponse, Startup } from "../../src";

class CustomStartup extends Startup {
  async run(): Promise<SfaResponse> {
    return await super.invoke(new HttpContext(new SfaRequest()));
  }
}

test("custom result handler", async function () {
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
