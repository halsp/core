import { Request } from "../../src";

describe("request path", () => {
  it("should set illegal path", async () => {
    const req = new Request().setPath("\\user");
    expect(req.path).toBe("user");
  });

  it("should set emtpy path", async () => {
    const req = new Request().setPath("");
    expect(req.path).toBe("");
  });

  it("should set path null", async () => {
    const req = new Request().setPath(null as any);
    expect(req.path).toBe("");
  });

  it("should save originalPath", async () => {
    const req = new Request().setPath("/abc/");

    expect(req.path).toBe("abc");
    expect(req.originalPath).toBe("/abc/");
  });

  it("should set path with https", async () => {
    const req = new Request().setPath("https://ipare.org/a/b");
    expect(req.path).toBe("a/b");
  });

  it("should set path with http", async () => {
    const req = new Request().setPath("http://ipare.org/a/b");
    expect(req.path).toBe("a/b");
  });

  it("should set path with http and port", async () => {
    const req = new Request().setPath("http://ipare.org:8080/a/b");
    expect(req.path).toBe("a/b");
  });

  it("should set path with http,port,query", async () => {
    const req = new Request().setPath("http://ipare.org:8080/a/b?c=1");
    expect(req.path).toBe("a/b");
  });

  it("should set path with http:/", async () => {
    const req = new Request().setPath("http:/ipare.org/a/b");
    expect(req.path).toBe("a/b");
  });
});
