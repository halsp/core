import { LambdaStartup } from "../src";

test("context", async () => {
  await new LambdaStartup()
    .use((ctx) => {
      const context1 = ctx.lambdaContext;
      const context2 = ctx.req.lambdaContext;
      const event1 = ctx.lambdaEvent;
      const event2 = ctx.req.lambdaEvent;
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
