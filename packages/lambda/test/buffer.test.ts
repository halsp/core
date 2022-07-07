import { LambdaStartup } from "../src";
import * as fs from "fs";

test("buffer", async () => {
  const res = await new LambdaStartup()
    .use(async (ctx, next) => {
      ctx.ok(ctx.req.body);
      await next();
    })
    .run(
      {
        body: Buffer.from("test", "utf-8").toString("base64"),
        isBase64Encoded: true,
      },
      {}
    );

  expect(res.isBase64Encoded).toBeTruthy();
  expect(res.body).toBe(Buffer.from("test", "utf-8").toString("base64"));
  expect(res.headers["content-type"]).toBe("application/octet-stream");
});

test("return stream", async () => {
  const res = await new LambdaStartup()
    .use(async (ctx) => {
      const stream = fs.createReadStream("./LICENSE");
      ctx.ok(stream);
    })
    .run({}, {});

  expect(res.isBase64Encoded).toBeTruthy();
  expect(res.body).toBe(fs.readFileSync("./LICENSE", "base64"));
  expect(res.headers["content-type"]).toBe("application/octet-stream");
});

test("return stream", async () => {
  const res = await new LambdaStartup()
    .use(async (ctx) => {
      const stream = fs.createReadStream("./LICENSE");
      stream.setEncoding("hex");
      ctx.ok(stream);
    })
    .run({}, {});

  expect(res.isBase64Encoded).toBeTruthy();
  expect(res.body).toBe(fs.readFileSync("./LICENSE").toString("base64"));
  expect(res.headers["content-type"]).toBe("application/octet-stream");
});

test("error stream", async () => {
  let error = false;
  try {
    await new LambdaStartup()
      .use(async (ctx) => {
        const stream = fs.createReadStream("./not-exist");
        ctx.ok(stream);
      })
      .run({}, {});
  } catch (err) {
    error = true;
  }
  expect(error).toBeTruthy();
});
