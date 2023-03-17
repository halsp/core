import { Response } from "@halsp/core";
import { initResultHandler, ResultHandler } from "../../src";

class CustomResultHandler {
  constructor() {
    initResultHandler(this, () => this.res);
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
