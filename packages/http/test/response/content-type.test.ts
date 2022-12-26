import { createReadStream, ReadStream } from "fs";
import { TestStartup } from "../test-startup";

test(`buffer`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.res.ok(Buffer.from("ipare"));
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("application/octet-stream");
  expect(res.get("content-length")).toBe(Buffer.byteLength("ipare").toString());
  expect(res.body).toEqual(Buffer.from("ipare"));
});

test(`stream`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.res.ok(createReadStream("./LICENSE"));
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("application/octet-stream");
  expect(res.get("content-length")).toBeUndefined();
  expect(res.body instanceof ReadStream).toBeTruthy();
});

test(`html`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.res.ok("<div>ipare</div>");
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("text/html; charset=utf-8");
  expect(res.get("content-length")).toBe(
    Buffer.byteLength("<div>ipare</div>").toString()
  );
  expect(res.body).toBe("<div>ipare</div>");
});

test(`json`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.res.ok({
        ipare: true,
      });
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("application/json; charset=utf-8");
  expect(res.get("content-length")).toBe(
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
      ctx.res.ok([1, 2]);
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("application/json; charset=utf-8");
  expect(res.get("content-length")).toBe(
    Buffer.byteLength(JSON.stringify([1, 2])).toString()
  );
  expect(res.body).toEqual([1, 2]);
});

test(`string set type`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.res
        .ok("ipare")
        .set("content-type", "text")
        .set("content-length", 100);
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("text");
  expect(res.get("content-length")).toBe("100");
  expect(res.body).toBe("ipare");
});

test(`josn set type`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.res
        .ok({
          app: "ipare",
        })
        .set("content-type", "json")
        .set("content-length", 100);
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("json");
  expect(res.get("content-length")).toBe("100");
  expect(res.body).toEqual({
    app: "ipare",
  });
});

test(`buffer set type`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.res
        .ok(Buffer.from("ipare"))
        .set("content-type", "bin")
        .set("content-length", 100);
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("bin");
  expect(res.get("content-length")).toBe("100");
  expect(res.body).toEqual(Buffer.from("ipare"));
});

test(`stream set type`, async () => {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.res
        .ok(createReadStream("./LICENSE"))
        .set("content-type", "bin")
        .set("content-length", 100);
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.get("content-type")).toBe("bin");
  expect(res.get("content-length")).toBe("100");
  expect(res.body instanceof ReadStream).toBeTruthy();
});
