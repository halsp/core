import { Context, Startup } from "../../src";

class CustomStartup extends Startup {
  async run(): Promise<Context> {
    return await super.invoke(new Context());
  }
}

test("custom result handler", async () => {
  const ctx = await new CustomStartup()
    .use((ctx) => {
      ctx.bag("result", {
        msg: "ok",
      });
    })
    .run();

  expect(ctx.bag("result")).toEqual({
    msg: "ok",
  });
});
