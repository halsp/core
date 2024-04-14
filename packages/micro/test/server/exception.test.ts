import { Startup } from "@halsp/core";
import { MicroException } from "../../src/server";
import "../../src/server";
import "@halsp/testing";

describe("exception", () => {
  it("should trans to plain object", async () => {
    const ex = new MicroException("err");
    expect(ex.message).toBe("err");
  });

  it("should set string error from MicroException.message ", async () => {
    await new Startup()
      .useMicro()
      .use(() => {
        throw new MicroException("abc");
      })
      .expect((res) => {
        expect(res.error).toBe("abc");
      })
      .test();
  });

  it("should set string error from string ", async () => {
    await new Startup()
      .useMicro()
      .use(() => {
        throw "abc";
      })
      .expect((res) => {
        expect(res.error).toBe("abc");
      })
      .test();
  });

  it("should set string error from Error", async () => {
    await new Startup()
      .useMicro()
      .use(() => {
        throw new Error("abc");
      })
      .expect((res) => {
        expect(res.error).toBe("abc");
      })
      .test();
  });

  it("should set string error from object with message property", async () => {
    await new Startup()
      .useMicro()
      .use(() => {
        throw {
          message: "abc",
        };
      })
      .expect((res) => {
        expect(res.error).toBe("abc");
      })
      .test();
  });

  it("should set empty error from empty object", async () => {
    await new Startup()
      .useMicro()
      .use(() => {
        throw {};
      })
      .expect((res) => {
        expect(res.error).toBe("");
      })
      .test();
  });

  it("should set empty error from null", async () => {
    await new Startup()
      .useMicro()
      .use(() => {
        throw null;
      })
      .expect((res) => {
        expect(res.error).toBe("");
      })
      .test();
  });
});
