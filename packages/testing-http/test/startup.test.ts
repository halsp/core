import { Request } from "@ipare/core";
import { TestHttpStartup } from "../src";

describe("startup", () => {
  new TestHttpStartup().it("default status is 404", (res) => {
    res.expect(404);
  });

  new TestHttpStartup()
    .use((ctx) => {
      ctx.ok();
    })
    .it("should set status 200", (res) => {
      res.expect(200);
    });

  new TestHttpStartup()
    .skipThrow()
    .setRequest(new Request())
    .use(() => {
      throw new Error("err");
    })
    .it("status shound be 500 if skip throw error", (res) => {
      res.expect(500, {
        status: 500,
        message: "err",
      });
    });

  it("should throw error", async () => {
    const startup = new TestHttpStartup().use(() => {
      throw new Error("err");
    });

    let err = false;
    try {
      await startup.run();
    } catch {
      err = true;
    }
    expect(err).toBeTruthy();
  });
});
