import { AlifcStartup } from "../../src";
import { createReadStream } from "fs";
import { newAliRes, newAliReq } from "../utils";

test("stream body", async function () {
  const aliContext: any = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new AlifcStartup()
    .use((ctx) => {
      ctx.ok(createReadStream("./LICENSE"));
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes.headers["content-type"]).toBe("application/octet-stream");
  const buffer = aliRes._body as Buffer;
  expect(buffer.toString().startsWith("MIT License")).toBeTruthy();
});
