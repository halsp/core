import { AlifcStartup } from "../../src";
import { newAliRes, newAliReq } from "../utils";

test("text body", async function () {
  const aliContext: any = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new AlifcStartup()
    .use((ctx) => {
      ctx.ok("BODY");
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toBe("BODY");
  expect(aliRes.headers["content-type"]).toBe("text/plain; charset=utf-8");
});

test("text body set type", async function () {
  const aliContext: any = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new AlifcStartup()
    .use((ctx) => {
      ctx.res.setHeader("content-type", "text/plain");
      ctx.res.setHeader("content-length", Buffer.byteLength("BODY").toString());
      ctx.ok("BODY");
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toBe("BODY");
  expect(aliRes.headers["content-type"]).toBe("text/plain");
});

test("html body", async function () {
  const aliContext: any = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new AlifcStartup()
    .use((ctx) => {
      ctx.ok("<div>BODY</div>");
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toBe("<div>BODY</div>");
  expect(aliRes.headers["content-type"]).toBe("text/html; charset=utf-8");
});
