import { Request } from "@halsp/core";
import "../../src";

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

  test("empty method", async () => {
    const req = new Request()
      .setMethod(null as unknown as string)
      .setHeader("X-HTTP-Method-Override".toLowerCase(), ["POST"]);
    expect(req.method).toBe("POST");
    expect(req.method).not.toBe("PATCH");
    expect(req.overrideMethod).toBeUndefined();
  });
});
