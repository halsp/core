import { SfaAlifunc, AliContext } from "../src";
import { newAliReq, newAliRes } from "./utils";

test("without md", async function () {
  const aliContext: AliContext = {};
  const aliReq = newAliReq();
  const aliRes = newAliRes();

  await new SfaAlifunc().run(aliReq, aliRes, aliContext);

  expect(aliRes.statusCode).toBe(404);
  expect(aliRes._body).toBe("");
});
