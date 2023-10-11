import { Startup } from "@halsp/core";
import "../src";

test("context", async () => {
  await new Startup()
    .useLambda()
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

test("request context method", async () => {
  await new Startup()
    .useLambda()
    .use((ctx) => {
      expect(ctx.req.method).toBe("POST");
    })
    .run(
      {
        requestContext: {
          http: {
            method: "post",
          },
        },
      },
      {},
    );
});
