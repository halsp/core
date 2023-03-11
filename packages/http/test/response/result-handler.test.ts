import { HttpResponse, initResultHandler, ResultHandler } from "../../src";

class CustomResultHandler {
  constructor() {
    initResultHandler(this, () => this.res);
  }

  readonly res = new HttpResponse();
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

describe("body", () => {
  it("should set res.body", async () => {
    const req = new HttpResponse().setBody("abc");
    expect(req.body).toBe("abc");
  });
});
