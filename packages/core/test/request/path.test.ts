import { SfaRequest } from "../../src";

test("short path", async function () {
  const req = new SfaRequest().setPath("/user");
  expect(req.path).toBe("user");

  const req2 = new SfaRequest().setPath("\\user");
  expect(req2.path).not.toBe("/user");
  expect(req2.path).toBe("user");
});

test("error path", async function () {
  const req = new SfaRequest().setPath("");
  expect(req.path).toBe("");

  const req2 = new SfaRequest().setPath("user");
  expect(req2.path).toBe("user");
});
