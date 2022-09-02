import { HttpMethod, Request } from "../../src";
import { TestStartup } from "../test-startup";

describe("method override", () => {
  test("method override", async () => {
    const req = new Request()
      .setMethod("PATCH")
      .setHeader("X-HTTP-Method-Override", "POST");
    expect(req.method).toBe("POST");
    expect(req.method).not.toBe("PATCH");
    expect(req.overrideMethod).toBe("PATCH");
  });

  test("method override upper case", async () => {
    const req = new Request()
      .setMethod("PATCH")
      .setHeader("X-HTTP-Method-Override".toUpperCase(), "POST");
    expect(req.method).toBe("POST");
    expect(req.method).not.toBe("PATCH");
    expect(req.overrideMethod).toBe("PATCH");
  });

  test("method override lower case", async () => {
    const req = new Request()
      .setMethod("PATCH")
      .setHeader("X-HTTP-Method-Override".toLowerCase(), "POST");
    expect(req.headers["X-HTTP-Method-Override".toLowerCase()]).toBe("POST");
    expect(req.method).toBe("POST");
    expect(req.method).not.toBe("PATCH");
    expect(req.overrideMethod).toBe("PATCH");
  });

  test("method override array", async () => {
    const req = new Request()
      .setMethod("PATCH")
      .setHeader("X-HTTP-Method-Override".toLowerCase(), ["POST"]);
    expect(req.method).toBe("POST");
    expect(req.method).not.toBe("PATCH");
    expect(req.overrideMethod).toBe("PATCH");
  });

  test("method override without value", async () => {
    const req = new Request()
      .setMethod("PATCH")
      .setHeader("X-HTTP-Method-Override".toLowerCase(), "");
    expect(req.method).toBe("PATCH");
    expect(req.overrideMethod).toBe(undefined);
  });

  test(`method override request`, async () => {
    const result = await new TestStartup(
      new Request().setMethod("PATCH".toUpperCase())
    )
      .use(async (ctx) => {
        ctx.ok({
          method: "GET",
        });
      })
      .run();

    expect(result.status).toBe(200);
    expect(result.body.method).toBe("GET");
  });

  test("empty method", async () => {
    const req = new Request()
      .setMethod(null as unknown as string)
      .setHeader("X-HTTP-Method-Override".toLowerCase(), ["POST"]);
    expect(req.method).toBe("POST");
    expect(req.method).not.toBe("PATCH");
    expect(req.overrideMethod).toBeUndefined();
  });
});

describe("HEAD method", () => {
  it("should replace to get when method is HEAD", async () => {
    const req = new Request().setMethod("head");
    expect(req.method).toBe(HttpMethod.get);
    expect(req.isHeadMethod).toBeTruthy();
  });

  it("should remove body when method is HEAD", async () => {
    const res = await new TestStartup(new Request().setMethod("HEAD"))
      .use(async (ctx, next) => {
        ctx.ok("<xml></xml>");
        await next();
      })
      .run();

    expect(res.get("content-type")).toBe("text/html; charset=utf-8");
    expect(res.status).toBe(200);
    expect(res.body).toBeUndefined();
  });
});
