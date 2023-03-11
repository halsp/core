import { HttpRequest } from "../../src";

describe("req.path", () => {
  it("should set illegal path", async () => {
    const req = new HttpRequest().setPath("\\user");
    expect(req.path).toBe("user");
  });

  it("should set emtpy path", async () => {
    const req = new HttpRequest().setPath("");
    expect(req.path).toBe("");
  });

  it("should set path null", async () => {
    const req = new HttpRequest().setPath(null as any);
    expect(req.path).toBe("");
  });

  it("should save originalPath", async () => {
    const req = new HttpRequest().setPath("/abc/");

    expect(req.path).toBe("abc");
    expect(req.originalPath).toBe("/abc/");
  });

  it("should set path with https", async () => {
    const req = new HttpRequest().setPath("https://halsp.org/a/b");
    expect(req.path).toBe("a/b");
    expect(req.originalPath).toBe("/a/b");
  });

  it("should set empty path with https", async () => {
    const req = new HttpRequest().setPath("https://halsp.org");
    expect(req.path).toBe("");
    expect(req.originalPath).toBe("");
  });

  it("should set empty path with https and end with /", async () => {
    const req = new HttpRequest().setPath("https://halsp.org/");
    expect(req.path).toBe("");
    expect(req.originalPath).toBe("/");
  });

  it("should set path with http", async () => {
    const req = new HttpRequest().setPath("http://halsp.org/a/b");
    expect(req.path).toBe("a/b");
    expect(req.originalPath).toBe("/a/b");
  });

  it("should set path with http and port", async () => {
    const req = new HttpRequest().setPath("http://halsp.org:8080/a/b");
    expect(req.path).toBe("a/b");
    expect(req.originalPath).toBe("/a/b");
  });

  it("should set path with http,port,query", async () => {
    const req = new HttpRequest().setPath("http://halsp.org:8080/a/b?c=1");
    expect(req.path).toBe("a/b");
    expect(req.originalPath).toBe("/a/b");
  });

  it("should set path with http:/", async () => {
    const req = new HttpRequest().setPath("http:/halsp.org/a/b");
    expect(req.path).toBe("a/b");
    expect(req.originalPath).toBe("/a/b");
  });
});
