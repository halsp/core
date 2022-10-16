import { MicroException } from "../src";

describe("exception", () => {
  it("should trans to plain object", async () => {
    const ex = new MicroException("err");
    expect(ex.toPlainObject()).toBe({
      status: "error",
      message: "err",
    });
  });
});
