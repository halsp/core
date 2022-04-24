import Koa from "koa";
import request from "supertest";
import { koaSfa } from "../src";

test("koaSfa", async () => {
  let index = 1;

  function getIndexValue() {
    const str = index.toString();
    index++;
    return str;
  }

  const koa = new Koa()
    .use(async (ctx, next) => {
      ctx.set("h1", getIndexValue());
      await next();
      ctx.set("h5", getIndexValue());
    })
    .use(
      koaSfa((startup) => {
        startup.use(async (ctx, next) => {
          ctx.res.created("created").setBody({
            b: 1,
          });
          ctx.setHeader("h2", getIndexValue());
          await next();
          ctx.setHeader("h4", getIndexValue());
        });
      })
    )
    .use((ctx) => {
      ctx.set("h3", getIndexValue());
    });
  const server = koa.listen();

  const res = await request(server).get("");
  server.close();

  expect(res.status).toBe(201);
  expect(res.headers["location"]).toBe("created");
  for (let i = 1; i <= 5; i++) {
    expect(res.headers[`h${i}`]).toBe(i.toString());
  }
  expect(res.body).toEqual({
    b: 1,
  });
});
