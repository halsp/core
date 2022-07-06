import { SfaAlifunc } from "../src";
import { newAliReq, newAliRes } from "./utils";

test("without md", async function () {
  const aliContext: any = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new SfaAlifunc().run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(404);
  expect(aliRes._body).toBe("");
});
