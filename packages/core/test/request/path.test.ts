import Request from "../../src/Request";

test("short path", async function () {
  const req = new Request().setPath("/user");

  expect(req.path).not.toBe("/user");
  expect(req.path).not.toBe("\\user");
  expect(req.path).toBe("user");

  const req2 = new Request().setPath("\\user");

  expect(req2.path).not.toBe("/user");
  expect(req2.path).toBe("user");
});

test("error path", async function () {
  const req = new Request().setPath("");
  expect(req.path).toBe("");

  const req2 = new Request().setPath("user");
  expect(req2.path).toBe("user");
});
