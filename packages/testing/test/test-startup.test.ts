import { Request } from "@ipare/core";
import { TestStartup } from "../src";

new TestStartup().it("default status is 404", (res) => {
  res.expect(404);
});

describe("skipThrow", () => {
  new TestStartup()
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

  it("error shound be throw", async () => {
    let errMsg: string | undefined;
    try {
      await new TestStartup()
        .use(() => {
          throw new Error("err");
        })
        .run();
    } catch (err) {
      errMsg = (err as Error).message;
    }
    expect(errMsg).toBe("err");
  });
});
