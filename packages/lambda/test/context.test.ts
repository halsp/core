import { SfaCloudbase } from "../src";

test("context", async () => {
  await new SfaCloudbase()
    .use((ctx) => {
      const context1 = ctx.cloudbaseContext;
      const context2 = ctx.req.cloudbaseContext;
      const event1 = ctx.cloudbaseEvent;
      const event2 = ctx.req.cloudbaseEvent;
      expect(context1).toEqual({
        a: 1,
      });
      expect(context1).toBe(context2);
      expect(event1).toEqual({
        b: "2",
      });
      expect(event1).toBe(event2);
    })
    .run({ a: 1 }, { b: "2" });
});
