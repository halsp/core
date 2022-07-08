import { AlifuncStartup } from "../../src";
import { newAliRes, newAliReq } from "../utils";

test("buffer body", async function () {
  const aliContext: any = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new AlifuncStartup()
    .use((ctx) => {
      ctx.ok(Buffer.from("BODY", "utf-8"));
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toEqual(Buffer.from("BODY", "utf-8"));
  expect(aliRes.headers["content-type"]).toBe("application/octet-stream");
});

test("buffer body set type", async function () {
  const aliContext: any = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new AlifuncStartup()
    .use((ctx) => {
      ctx.res.setHeader("content-type", "application/octet-stream");
      ctx.res.setHeader(
        "content-length",
        Buffer.from("BODY", "utf-8").length.toString()
      );
      ctx.ok(Buffer.from("BODY", "utf-8"));
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toEqual(Buffer.from("BODY", "utf-8"));
  expect(aliRes.headers["content-type"]).toBe("application/octet-stream");
});
