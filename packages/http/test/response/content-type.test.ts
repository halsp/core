import { Startup } from "@halsp/core";
import { createReadStream, ReadStream } from "fs";
import "../../src";

test(`buffer`, async () => {
  const res = await new Startup()
    .useHttp()
    .use(async (ctx) => {
      ctx.res.ok(Buffer.from("halsp"));
    })
    ["invoke"]();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("application/octet-stream");
  expect(res.get("content-length")).toBe(Buffer.byteLength("halsp").toString());
  expect(res.body).toEqual(Buffer.from("halsp"));
});

test(`stream`, async () => {
  const res = await new Startup()
    .useHttp()
    .use(async (ctx) => {
      ctx.res.ok(createReadStream("./LICENSE"));
    })
    ["invoke"]();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("application/octet-stream");
  expect(res.get("content-length")).toBeUndefined();
  expect(res.body instanceof ReadStream).toBeTruthy();
});

test(`html`, async () => {
  const res = await new Startup()
    .useHttp()
    .use(async (ctx) => {
      ctx.res.ok("<div>halsp</div>");
    })
    ["invoke"]();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("text/html; charset=utf-8");
  expect(res.get("content-length")).toBe(
    Buffer.byteLength("<div>halsp</div>").toString()
  );
  expect(res.body).toBe("<div>halsp</div>");
});

test(`json`, async () => {
  const res = await new Startup()
    .useHttp()
    .use(async (ctx) => {
      ctx.res.ok({
        halsp: true,
      });
    })
    ["invoke"]();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("application/json; charset=utf-8");
  expect(res.get("content-length")).toBe(
    Buffer.byteLength(
      JSON.stringify({
        halsp: true,
      })
    ).toString()
  );
  expect(res.body).toEqual({
    halsp: true,
  });
});

test(`array`, async () => {
  const res = await new Startup()
    .useHttp()
    .use(async (ctx) => {
      ctx.res.ok([1, 2]);
    })
    ["invoke"]();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("application/json; charset=utf-8");
  expect(res.get("content-length")).toBe(
    Buffer.byteLength(JSON.stringify([1, 2])).toString()
  );
  expect(res.body).toEqual([1, 2]);
});

test(`string set type`, async () => {
  const res = await new Startup()
    .useHttp()
    .use(async (ctx) => {
      ctx.res
        .ok("halsp")
        .set("content-type", "text")
        .set("content-length", 100);
    })
    ["invoke"]();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("text");
  expect(res.get("content-length")).toBe("100");
  expect(res.body).toBe("halsp");
});

test(`josn set type`, async () => {
  const res = await new Startup()
    .useHttp()
    .use(async (ctx) => {
      ctx.res
        .ok({
          app: "halsp",
        })
        .set("content-type", "json")
        .set("content-length", 100);
    })
    ["invoke"]();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("json");
  expect(res.get("content-length")).toBe("100");
  expect(res.body).toEqual({
    app: "halsp",
  });
});

test(`buffer set type`, async () => {
  const res = await new Startup()
    .useHttp()
    .use(async (ctx) => {
      ctx.res
        .ok(Buffer.from("halsp"))
        .set("content-type", "bin")
        .set("content-length", 100);
    })
    ["invoke"]();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("bin");
  expect(res.get("content-length")).toBe("100");
  expect(res.body).toEqual(Buffer.from("halsp"));
});

test(`stream set type`, async () => {
  const res = await new Startup()
    .useHttp()
    .use(async (ctx) => {
      ctx.res
        .ok(createReadStream("./LICENSE"))
        .set("content-type", "bin")
        .set("content-length", 100);
    })
    ["invoke"]();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("bin");
  expect(res.get("content-length")).toBe("100");
  expect(res.body instanceof ReadStream).toBeTruthy();
});
