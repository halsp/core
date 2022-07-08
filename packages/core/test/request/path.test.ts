import { Request } from "../../src";

test("short path", async () => {
  const req = new Request().setPath("/user");
  expect(req.path).toBe("user");

  const req2 = new Request().setPath("\\user");
  expect(req2.path).not.toBe("/user");
  expect(req2.path).toBe("user");
});

test("error path", async () => {
  const req = new Request().setPath("");
  expect(req.path).toBe("");

  const req2 = new Request().setPath("user");
  expect(req2.path).toBe("user");
});
