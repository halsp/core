import { TestHttpStartup } from "../src";

test("test http", async () => {
  const res = await new TestHttpStartup()
    .use((ctx) => {
      ctx.ok({
        method: ctx.req.method,
        path: ctx.req.path,
      });
    })
    .run((request) => request.get("/url"));

  expect(res.body).toEqual({
    method: "GET",
    path: "url",
  });
});

test("test http port occupy", async () => {
  const res1 = await new TestHttpStartup()
    .use((ctx) => {
      ctx.ok({
        method: ctx.req.method,
        path: ctx.req.path,
      });
    })
    .run(async (request) => {
      const res2 = await new TestHttpStartup()
        .use((ctx) => {
          ctx.ok();
        })
        .run((request2) => request2.get("/"));
      expect(res2.status).toBe(200);

      return request.get("/");
    });

  expect(res1.status).toBe(200);
});

test("test http port error", async () => {
  let isErr = false;
  try {
    await new TestHttpStartup()
      .use((ctx) => {
        ctx.ok();
      })
      .run(
        (request) => {
          return request.get("/url");
        },
        undefined,
        "256.0.0.0"
      );
  } catch (err) {
    isErr = true;
  }
  expect(isErr).toBeTruthy();
});
