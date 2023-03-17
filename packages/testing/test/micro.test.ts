import { Request, Response } from "@halsp/core";
import { TestMicroStartup } from "../src/micro";

describe("micro response.expect", () => {
  it("should expect body", async () => {
    new Response()
      .setBody({
        a: 1,
      })
      .expect(undefined, {
        a: 1,
      });
  });
});

describe("micro startup", () => {
  it("default body is undefined", async () => {
    await new TestMicroStartup().expect((res) => {
      res.expect(undefined);
    });
  });

  it("should set res.body ok", async () => {
    await new TestMicroStartup()
      .use((ctx) => {
        ctx.res.setBody("ok");
      })
      .expect((res) => {
        res.expect((res) => {
          expect(res.body).toBe("ok");
        });
      });
  });

  it("shound set res.body if skip throw error", async () => {
    await new TestMicroStartup()
      .setSkipThrow()
      .setContext(new Request())
      .use(() => {
        throw new Error("err");
      })
      .expect((res) => {
        expect(res.body).toBeUndefined();
        expect(res.error).toBe("err");
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
});
