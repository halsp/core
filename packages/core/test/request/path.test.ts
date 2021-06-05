import Request from "../../src/Request";

test("short path", async function () {
  const req = new Request().setPath("/user").setHeader("custom-header", "aaa");

  expect(req.path).not.toBe("/user");
  expect(req.path).toBe("user");
});
