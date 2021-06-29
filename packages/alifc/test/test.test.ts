import SfaAlifunc, { AliReq, AliRes, AliContext } from "../src";
import * as http from "http";
import { Socket } from "net";

function newAliReq(): AliReq {
  const result = new http.IncomingMessage(new Socket()) as AliReq;
  Object.assign(result, {
    path: "",
    method: "",
    headers: {} as Record<string, string>,
    queries: {} as Record<string, string>,
    url: "",
    clientIP: "",
  });
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function newAliRes(): AliRes & { _body: any } {
  const aliRes = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _body: undefined as any,
    statusCode: 404,
    headers: {} as Record<string, string>,
    setStatusCode: (code: number) => {
      aliRes.statusCode = code;
    },
    setHeader: (key: string, val: string) => {
      aliRes.headers[key] = val;
    },
    deleteHeader: (key: string) => {
      delete aliRes.headers[key];
    },
    hasHeader: (key: string) => {
      return Object.keys(aliRes.headers).includes(key);
    },
    send: (val: string | Buffer) => {
      aliRes._body = val;
    },
  };
  return aliRes;
}

test("without md", async function () {
  const aliContext: AliContext = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new SfaAlifunc().run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(404);
  expect(aliRes._body).toBe("");
});

test("json body", async function () {
  const aliContext: AliContext = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new SfaAlifunc()
    .use(async (ctx) => {
      ctx.ok({
        content: "BODY",
      });
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toBe(
    JSON.stringify({
      content: "BODY",
    })
  );
  expect(aliRes.headers["Content-Type"]).toBe(
    "application/json; charset=utf-8"
  );
});

test("json body set type", async function () {
  const aliContext: AliContext = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  const body = {
    content: "BODY",
  };
  const strBody = JSON.stringify(body);

  await new SfaAlifunc()
    .use(async (ctx) => {
      ctx.res.setHeader("content-type", "application/json");
      ctx.res.setHeader(
        "content-Length",
        Buffer.byteLength(strBody).toString()
      );
      ctx.ok(body);
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toBe(strBody);
  expect(aliRes.headers["content-type"]).toBe("application/json");
});

test("text body", async function () {
  const aliContext: AliContext = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new SfaAlifunc()
    .use(async (ctx) => {
      ctx.ok("BODY");
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toBe("BODY");
  expect(aliRes.headers["Content-Type"]).toBe("text/plain; charset=utf-8");
});

test("text body set type", async function () {
  const aliContext: AliContext = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new SfaAlifunc()
    .use(async (ctx) => {
      ctx.res.setHeader("content-type", "text/plain");
      ctx.res.setHeader("content-Length", Buffer.byteLength("BODY").toString());
      ctx.ok("BODY");
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toBe("BODY");
  expect(aliRes.headers["content-type"]).toBe("text/plain");
});

test("html body", async function () {
  const aliContext: AliContext = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new SfaAlifunc()
    .use(async (ctx) => {
      ctx.ok("<div>BODY</div>");
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toBe("<div>BODY</div>");
  expect(aliRes.headers["Content-Type"]).toBe("text/html; charset=utf-8");
});

test("buffer body", async function () {
  const aliContext: AliContext = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new SfaAlifunc()
    .use(async (ctx) => {
      ctx.ok(Buffer.from("BODY", "utf-8"));
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toEqual(Buffer.from("BODY", "utf-8"));
  expect(aliRes.headers["Content-Type"]).toBe("application/octet-stream");
});

test("buffer body set type", async function () {
  const aliContext: AliContext = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new SfaAlifunc()
    .use(async (ctx) => {
      ctx.res.setHeader("content-type", "application/octet-stream");
      ctx.res.setHeader(
        "content-Length",
        Buffer.from("BODY", "utf-8").length.toString()
      );
      ctx.ok(Buffer.from("BODY", "utf-8"));
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toEqual(Buffer.from("BODY", "utf-8"));
  expect(aliRes.headers["content-type"]).toBe("application/octet-stream");
});

test("prase json", async function () {
  const aliContext: AliContext = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  aliReq.headers["content-type"] = "application/json";

  await new SfaAlifunc()
    .useHttpJsonBody()
    .use(async (ctx) => {
      ctx.ok(ctx.req.body);
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes._body).toBe("");
});
