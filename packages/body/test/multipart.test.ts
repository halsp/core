import request from "supertest";
import { File } from "formidable";
import { readFileSync } from "fs";
import "./utils";
import { MultipartBody } from "../src";
import { HookType, Startup } from "@halsp/core";

test("useHttpMultipartBody", async () => {
  let invoke = false;
  const server = new Startup()
    .keepThrow()
    .use(async (ctx, next) => {
      await next();

      expect(ctx.res.body.fields).toEqual({
        name: ["fileName"],
      });
      expect(ctx.res.body.file.name).toBe("LICENSE");
      expect(
        (ctx.res.body.file.content as string).startsWith("MIT License"),
      ).toBeTruthy();
      invoke = true;
    })
    .useHttpMultipartBody()
    .use(async (ctx) => {
      const multipartBody = ctx.req.body as MultipartBody;
      if (!multipartBody) return;
      const file = multipartBody.files.file as File[];

      ctx.res.ok({
        fields: multipartBody.fields,
        file: {
          name: file[0].originalFilename,
          content: readFileSync(file[0].filepath, "utf-8"),
        },
      });
    })
    .listenTest();
  await request(server)
    .post("")
    .field("name", "fileName")
    .attach("file", "./LICENSE");
  server.close();
  expect(invoke).toBeTruthy();
});

test("on file begin", async () => {
  let invoke = false;
  const server = new Startup()
    .keepThrow()
    .use(async (ctx, next) => {
      await next();

      expect(ctx.res.get("file-name")).toBe("LICENSE");
      expect(ctx.res.body).toBe("LICENSE");
      invoke = true;
    })
    .useHttpMultipartBody(undefined, (ctx, formName, file) => {
      ctx.res.setHeader("file-name", file.originalFilename ?? "");
      expect(formName).toBe("file");
      expect(file.originalFilename).toBe("LICENSE");
    })
    .use(async (ctx) => {
      const multipartBody = ctx.req.body as MultipartBody;
      if (!multipartBody) return;
      const file = multipartBody.files.file as File[];

      ctx.res.ok(file[0].originalFilename);
    })
    .listenTest();
  await request(server)
    .post("")
    .field("name", "fileName")
    .attach("file", "./LICENSE");
  server.close();
  expect(invoke).toBeTruthy();
});

test("prase file error without callback", async () => {
  let invoke = false;
  const server = new Startup()
    .hook(HookType.Unhandled, (ctx, md, err) => {
      console.error("err", err);
    })
    .use(async (ctx, next) => {
      await next();

      expect(ctx.res.status).toBe(400);
      expect(ctx.res.body).toBeUndefined();
      invoke = true;
    })
    .useHttpMultipartBody()
    .use(async (ctx) => {
      ctx.res.noContent();
    })
    .listenTest();

  const body =
    "--foo\r\n" +
    "Content-Type: application/octet-stream\r\n" +
    'Content-Disposition: form-data; name="file"; filename="file"\r\n' +
    "Content-Transfer-Encoding: unknown\r\n" +
    "\r\nThis is the first file\r\n" +
    "--foo--\r\n";

  await request(server)
    .post("")
    .set("content-type", "multipart/form-data; boundary=foo")
    .send(body);
  server.close();
  expect(invoke).toBeTruthy();
});

test("prase file error", async () => {
  let invoke = false;
  const server = new Startup()
    .use(async (ctx, next) => {
      await next();

      expect(ctx.res.status).toBe(400);
      expect(ctx.res.get("parse-err")).toBe("unknown transfer-encoding");
      invoke = true;
    })
    .useHttpMultipartBody(undefined, undefined, async (ctx, err) => {
      ctx.res.set("parse-err", err.message);
    })
    .use(async (ctx) => {
      ctx.res.noContent();
    })
    .listenTest();

  const body =
    "--foo\r\n" +
    "Content-Type: application/octet-stream\r\n" +
    'Content-Disposition: form-data; name="file"; filename="file"\r\n' +
    "Content-Transfer-Encoding: unknown\r\n" +
    "\r\nThis is the first file\r\n" +
    "--foo--\r\n";

  await request(server)
    .post("")
    .set("content-type", "multipart/form-data; boundary=foo")
    .send(body);
  server.close();
  expect(invoke).toBeTruthy();
});
