import { ResultHandler, SfaResponse } from "../../src";

class CustomResultHandler extends ResultHandler {
  constructor() {
    super(() => this.res);
  }

  readonly res = new SfaResponse();
}

test("custom result handler", async function () {
  const result = new CustomResultHandler().ok({
    msg: "ok",
  });

  expect(result.res.body).toEqual({
    msg: "ok",
  });
  expect(result.res.status).toBe(200);
});
