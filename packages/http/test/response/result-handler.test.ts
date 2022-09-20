import { ResultHandler, Response } from "../../src";

class CustomResultHandler extends ResultHandler {
  constructor() {
    super(() => this.res);
  }

  readonly res = new Response();
}

test("custom result handler", async () => {
  const result = new CustomResultHandler().ok({
    msg: "ok",
  });

  expect(result.res.body).toEqual({
    msg: "ok",
  });
  expect(result.res.status).toBe(200);
});
