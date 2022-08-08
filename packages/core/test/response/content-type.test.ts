import { createReadStream, ReadStream } from "fs";
import { TestStartup } from "../test-startup";

test(`buffer`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.ok(Buffer.from("ipare"));
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("application/octet-stream");
  expect(res.getHeader("content-length")).toBe(
    Buffer.byteLength("ipare").toString()
  );
  expect(res.body).toEqual(Buffer.from("ipare"));
});

test(`stream`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.ok(createReadStream("./LICENSE"));
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("application/octet-stream");
  expect(res.getHeader("content-length")).toBeUndefined();
  expect(res.body instanceof ReadStream).toBeTruthy();
});

test(`html`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.ok("<div>ipare</div>");
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("text/html; charset=utf-8");
  expect(res.getHeader("content-length")).toBe(
    Buffer.byteLength("<div>ipare</div>").toString()
  );
  expect(res.body).toBe("<div>ipare</div>");
});

test(`json`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.ok({
        ipare: true,
      });
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("application/json; charset=utf-8");
  expect(res.getHeader("content-length")).toBe(
    Buffer.byteLength(
      JSON.stringify({
        ipare: true,
      })
    ).toString()
  );
  expect(res.body).toEqual({
    ipare: true,
  });
});

test(`array`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.ok([1, 2]);
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("application/json; charset=utf-8");
  expect(res.getHeader("content-length")).toBe(
    Buffer.byteLength(JSON.stringify([1, 2])).toString()
  );
  expect(res.body).toEqual([1, 2]);
});

test(`string set type`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx
        .ok("ipare")
        .setHeader("content-type", "text")
        .setHeader("content-length", 100);
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("text");
  expect(res.getHeader("content-length")).toBe("100");
  expect(res.body).toBe("ipare");
});

test(`josn set type`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx
        .ok({
          app: "ipare",
        })
        .setHeader("content-type", "json")
        .setHeader("content-length", 100);
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("json");
  expect(res.getHeader("content-length")).toBe("100");
  expect(res.body).toEqual({
    app: "ipare",
  });
});

test(`buffer set type`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx
        .ok(Buffer.from("ipare"))
        .setHeader("content-type", "bin")
        .setHeader("content-length", 100);
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.getHeader("content-type")).toBe("bin");
  expect(res.getHeader("content-length")).toBe("100");
  expect(res.body).toEqual(Buffer.from("ipare"));
});

test(`stream set type`, async () => {
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
