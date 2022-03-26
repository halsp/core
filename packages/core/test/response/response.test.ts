import { SfaResponse } from "../../src";

test(`response`, async function () {
  const res = new SfaResponse(201, "", {
    h: 1,
  });

  expect(res.status).toBe(201);
  expect(res.getHeader("h")).toBe("1");
  expect(res.body).toEqual("");
});
