import { Request } from "../../src";

test("str body", async () => {
  const req = new Request().setBody("test body");

  expect(typeof req.body).toBe("string");
  expect(req.body).toBe("test body");
});

test("obj body", async () => {
  const req = new Request().setBody({
    b1: 1,
    b2: "2",
  });

  expect(req.body.b1).toBe(1);
  expect(req.body.b2).toBe("2");
});
