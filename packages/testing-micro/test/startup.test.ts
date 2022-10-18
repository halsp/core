import { Request } from "@ipare/core";
import { TestMicroStartup } from "../src";

describe("startup", () => {
  new TestMicroStartup().it("default body is undefined", (res) => {
    res.expect(undefined);
  });

  new TestMicroStartup()
    .use((ctx) => {
      ctx.res.setBody("ok");
    })
    .it("should set res.body ok", (res) => {
      res.expect("ok");
    });

  new TestMicroStartup()
    .skipThrow()
    .setContext(new Request())
    .use(() => {
      throw new Error("err");
    })
    .it("shound set res.body if skip throw error", (res) => {
      res.expect({
        status: "error",
        message: "err",
      });
    });

  it("should throw error", async () => {
    const startup = new TestMicroStartup().use(() => {
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

  it("should call other methods", async () => {
    const startup = new TestMicroStartup();
    startup.listen();
    startup.close();
  });
});