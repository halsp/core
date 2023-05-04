import { Startup } from "@halsp/core";
import { createReadStream } from "fs";
import { newAliRes, newAliReq } from "../utils";

test("stream body", async function () {
  const aliContext: any = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new Startup()
    .useAlifc()
    .use((ctx) => {
      ctx.res.ok(createReadStream("./LICENSE"));
    })
    .run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(200);
  expect(aliRes.headers["content-type"]).toBe("application/octet-stream");
  const buffer = aliRes._body as Buffer;
  expect(buffer.toString().startsWith("MIT License")).toBeTruthy();
});
