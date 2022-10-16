import { Response } from "@ipare/core";
import { initResultHandler, ResultHandler } from "../../src";

class CustomResultHandler {
  constructor() {
    initResultHandler(
      this,
      () => this.res,
      () => this.res.headers,
      () => this.res.headers
    );
  }

  readonly res = new Response();
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CustomResultHandler extends ResultHandler {}

test("custom result handler", async () => {
  const result = new CustomResultHandler().ok({
    msg: "ok",
  });

  expect(result.res.body).toEqual({
    msg: "ok",
  });
  expect(result.res.status).toBe(200);
});
