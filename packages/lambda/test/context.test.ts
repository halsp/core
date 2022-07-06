import { SfaCloudbase } from "../src";

test("context", async function () {
  await new SfaCloudbase()
    .use(async (ctx) => {
      expect(ctx.req.context).toEqual({
        a: 1,
      });
      expect(ctx.req.event).toEqual({
        b: "2",
      });
    })
    .run({ a: 1 }, { b: "2" });
});
