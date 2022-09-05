import Koa from "koa";
import request from "supertest";
import { koaIpare } from "../src";
import path from "path";

describe("koa-ipare", () => {
  it("should connect middlewares", async () => {
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
        koaIpare((startup) => {
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

  it("should parse streaming body", async function () {
    let working = false;
    const koa = new Koa()
      .use(
        koaIpare((startup) => {
          startup
            .useKoa(
              new Koa().use(async (ctx, next) => {
                ctx.body = ctx.req.read(100);
                ctx.status = 200;
                ctx.set("h1", ctx.req.headers.h1 as string);
                ctx.set("h2", ctx.req.headers.h2 as string);
                await next();
              })
            )
            .use(async (ctx, next) => {
              const res = ctx.res;
              expect(!!res).toBeTruthy();
              if (!res) {
                await next();
                return;
              }

              expect(res.status).toBe(200);
              expect(
                (res.body as Buffer)
                  .toString("utf-8")
                  .startsWith("--------------------")
              ).toBeTruthy();
              expect(res.getHeader("content-type")).toBe(
                "application/octet-stream"
              );
              expect(res.headers["h1"]).toBe("1");
              expect(res.headers["h2"]).toBe("2");
              await next();

              working = true;
            });
        })
      )
      .use(async (ctx) => {
        ctx.res.end("");
      });
    const server = koa.listen();

    try {
      await request(server)
        .put("")
        .set("h1", "1")
        .set("h2", "2")
        .field("name", "fileName")
        .attach("file", path.join(__dirname, "../tsconfig.json"));
      server.close();
    } catch (err) {
      server.close();
      // node 16.x bug
    } finally {
      expect(working).toBeTruthy();
    }
  });
});
