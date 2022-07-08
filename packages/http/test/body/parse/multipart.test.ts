import { MultipartBody, HttpStartup } from "../../../src";
import request from "supertest";
import { File } from "formidable";
import { readFileSync } from "fs";

test("useHttpMultipartBody", async () => {
  const server = new HttpStartup()
    .useHttpMultipartBody()
    .use(async (ctx) => {
      const multipartBody = ctx.req.body as MultipartBody;
      if (!multipartBody) return;
      const file = multipartBody.files.file as File;

      ctx.ok({
        fields: multipartBody.fields,
        file: {
          name: file.originalFilename,
          content: readFileSync(file.filepath, "utf-8"),
        },
      });
    })
    .listen();
  const res = await request(server)
    .post("")
    .field("name", "fileName")
    .attach("file", "./LICENSE");
  server.close();

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
  expect(res.body.fields).toEqual({
    name: "fileName",
  });
  expect(res.body.file.name).toBe("LICENSE");
  expect(
    (res.body.file.content as string).startsWith("MIT License")
  ).toBeTruthy();
});

test("on file begin", async () => {
  const server = new HttpStartup()
    .useHttpMultipartBody(undefined, (ctx, formName, file) => {
      ctx.res.setHeader("file-name", file.originalFilename ?? "");
      expect(formName).toBe("file");
      expect(file.originalFilename).toBe("LICENSE");
    })
    .use(async (ctx) => {
      const multipartBody = ctx.req.body as MultipartBody;
      if (!multipartBody) return;
      const file = multipartBody.files.file as File;

      ctx.ok(file.originalFilename);
    })
    .listen();
  const res = await request(server)
    .post("")
    .field("name", "fileName")
    .attach("file", "./LICENSE");
  server.close();

  expect(res.status).toBe(200);
  expect(res.headers["file-name"]).toBe("LICENSE");
  expect(res.text).toBe("LICENSE");
});

test("prase file error without callback", async () => {
  const server = new HttpStartup()
    .useHttpMultipartBody()
    .use(async (ctx) => {
      ctx.noContent();
    })
    .listen();

  const body =
    "--foo\r\n" +
    "Content-Type: application/octet-stream\r\n" +
    'Content-Disposition: form-data; name="file"; filename="file"\r\n' +
    "Content-Transfer-Encoding: unknown\r\n" +
    "\r\nThis is the first file\r\n" +
    "--foo--\r\n";

  const res = await request(server)
    .post("")
    .set("content-type", "multipart/form-data; boundary=foo")
    .send(body);
  server.close();

  expect(res.status).toBe(400);
  expect(res.body).toEqual({});
  expect(res.text).toEqual("");
});

test("prase file error", async () => {
  const server = new HttpStartup()
    .useHttpMultipartBody(undefined, undefined, async (ctx, err) => {
      ctx.res.setHeader("prase-err", err.message);
    })
    .use(async (ctx) => {
      ctx.noContent();
    })
    .listen();

  const body =
    "--foo\r\n" +
    "Content-Type: application/octet-stream\r\n" +
    'Content-Disposition: form-data; name="file"; filename="file"\r\n' +
    "Content-Transfer-Encoding: unknown\r\n" +
    "\r\nThis is the first file\r\n" +
    "--foo--\r\n";

  const res = await request(server)
    .post("")
    .set("content-type", "multipart/form-data; boundary=foo")
    .send(body);
  server.close();

  expect(res.status).toBe(400);
  expect(res.headers["prase-err"]).toBe("unknown transfer-encoding");
});
