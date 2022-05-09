import { TestHttp } from "../src";

test("test http", async () => {
  const res = await new TestHttp()
    .use((ctx) => {
      ctx.ok({
        method: ctx.req.method,
        path: ctx.req.path,
      });
    })
    .run((request) => {
      return request.get("/url");
    });

  expect(res.body).toEqual({
    method: "GET",
    path: "url",
  });
});

test("test http port occupy", async () => {
  const res1 = await new TestHttp()
    .use((ctx) => {
      ctx.ok({
        method: ctx.req.method,
        path: ctx.req.path,
      });
    })
    .run(async (request) => {
      const res2 = await new TestHttp()
        .use((ctx) => {
          ctx.ok();
        })
        .run((request2) => request2.get("/"));
      expect(res2.status).toBe(200);

      return request.get("/") as any;
    });

  expect(res1.status).toBe(200);
});

test("test http port error", async () => {
  let isErr = false;
  try {
    await new TestHttp()
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
