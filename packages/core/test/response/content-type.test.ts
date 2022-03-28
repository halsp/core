import { createReadStream, ReadStream } from "fs";
import { TestStartup } from "../../src";

test(`buffer`, async function () {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.ok(Buffer.from("sfa"));
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("application/octet-stream");
  expect(res.body).toEqual(Buffer.from("sfa"));
});

test(`stream`, async function () {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.ok(createReadStream("./LICENSE"));
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("application/octet-stream");
  expect(res.body instanceof ReadStream).toBeTruthy();
});

test(`html`, async function () {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.ok("<div>sfa</div>");
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("text/html; charset=utf-8");
  expect(res.body).toBe("<div>sfa</div>");
});

test(`string set type`, async function () {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx
        .ok("sfa")
        .setHeader("content-type", "text")
        .setHeader("content-length", 100);
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("text");
  expect(res.getHeader("content-length")).toBe("100");
  expect(res.body).toBe("sfa");
});

test(`josn set type`, async function () {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx
        .ok({
          app: "sfa",
        })
        .setHeader("content-type", "json")
        .setHeader("content-length", 100);
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("json");
  expect(res.getHeader("content-length")).toBe("100");
  expect(res.body).toEqual({
    app: "sfa",
  });
});

test(`buffer set type`, async function () {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx
        .ok(Buffer.from("sfa"))
        .setHeader("content-type", "bin")
        .setHeader("content-length", 100);
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("bin");
  expect(res.getHeader("content-length")).toBe("100");
  expect(res.body).toEqual(Buffer.from("sfa"));
});

test(`stream set type`, async function () {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx
        .ok(createReadStream("./LICENSE"))
        .setHeader("content-type", "bin")
        .setHeader("content-length", 100);
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("bin");
  expect(res.getHeader("content-length")).toBe("100");
  expect(res.body instanceof ReadStream).toBeTruthy();
});
