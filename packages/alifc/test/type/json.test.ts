import "@halsp/body";
import { Startup } from "@halsp/core";
import { newAliRes, newAliReq } from "../utils";

test("json body", async function () {
  const aliContext: any = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new Startup()
    .useAlifc()
    .use((ctx) => {
      ctx.res.ok({
        content: "BODY",
      });
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toBe(
    JSON.stringify({
      content: "BODY",
    }),
  );
  expect(aliRes.headers["content-type"]).toBe(
    "application/json; charset=utf-8",
  );
});

test("json body set type", async function () {
  const aliContext: any = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  const body = {
    content: "BODY",
  };
  const strBody = JSON.stringify(body);

  await new Startup()
    .useAlifc()
    .use((ctx) => {
      ctx.res.setHeader("content-type", "application/json");
      ctx.res.setHeader(
        "content-length",
        Buffer.byteLength(strBody).toString(),
      );
      ctx.res.ok(body);
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toBe(strBody);
  expect(aliRes.headers["content-type"]).toBe("application/json");
});

test("prase json", async function () {
  const aliContext: any = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  aliReq.headers["content-type"] = "application/json";

  await new Startup()
    .useAlifc()
    .use((ctx) => {
      ctx.res.ok(ctx.req.body);
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toBe("");
});
