import { HttpMethods } from "../src";

describe("http methods", () => {
  it("should be upperCase", async () => {
    expect(HttpMethods.post.toUpperCase()).toBe("POST");
    expect(HttpMethods.get.toUpperCase()).toBe("GET");
    expect(HttpMethods.any.toUpperCase()).toBe("ANY");
    expect(HttpMethods.delete.toUpperCase()).toBe("DELETE");
    expect(HttpMethods.patch.toUpperCase()).toBe("PATCH");
    expect(HttpMethods.connect.toUpperCase()).toBe("CONNECT");
    expect(HttpMethods.head.toUpperCase()).toBe("HEAD");
    expect(HttpMethods.options.toUpperCase()).toBe("OPTIONS");
    expect(HttpMethods.put.toUpperCase()).toBe("PUT");
    expect(HttpMethods.move.toUpperCase()).toBe("MOVE");
    expect(HttpMethods.copy.toUpperCase()).toBe("COPY");
    expect(HttpMethods.link.toUpperCase()).toBe("LINK");
    expect(HttpMethods.unlink.toUpperCase()).toBe("UNLINK");
    expect(HttpMethods.wrapped.toUpperCase()).toBe("WRAPPED");
  });

  it("should match methods", async () => {
    expect(HttpMethods.matched("")).toBe(undefined);
    expect(HttpMethods.matched("get")).toBe("GET");
    expect(HttpMethods.matched("Post")).toBe("POST");
    expect(HttpMethods.matched("PUT")).toBe("PUT");
    expect(HttpMethods.matched("DELETE")).toBe("DELETE");
    expect(HttpMethods.matched("PATCH")).toBe("PATCH");
    expect(HttpMethods.matched("ANY")).toBe("ANY");
    expect(HttpMethods.matched("HEAD")).toBe("HEAD");
    expect(HttpMethods.matched("OPTIONS")).toBe("OPTIONS");
    expect(HttpMethods.matched("TRACE")).toBe("TRACE");
    expect(HttpMethods.matched("CONNECT")).toBe("CONNECT");
    expect(HttpMethods.matched("MOVE")).toBe("MOVE");
    expect(HttpMethods.matched("COPY")).toBe("COPY");
    expect(HttpMethods.matched("LINK")).toBe("LINK");
    expect(HttpMethods.matched("UNLINK")).toBe("UNLINK");
    expect(HttpMethods.matched("WRAPPED")).toBe("WRAPPED");
  });

  it("should match custom methods with custom list", async () => {
    expect(HttpMethods.matched("CUSTOM1", ["CUSTOM1", "CUSTOM2"])).toBe(
      "CUSTOM1"
    );
    expect(HttpMethods.matched("Custom1", ["CUSTOM1", "CUSTOM2"])).toBe(
      "CUSTOM1"
    );
    expect(HttpMethods.matched("custom1", ["CUSTOM1", "CUSTOM2"])).toBe(
      "CUSTOM1"
    );

    expect(HttpMethods.matched("CUSTOM2", ["CUSTOM1", "CUSTOM2"])).toBe(
      "CUSTOM2"
    );
    expect(HttpMethods.matched("Custom2", ["CUSTOM1", "CUSTOM2"])).toBe(
      "CUSTOM2"
    );
    expect(HttpMethods.matched("custom2", ["CUSTOM1", "CUSTOM2"])).toBe(
      "CUSTOM2"
    );

    expect(
      HttpMethods.matched("CUSTOM", ["CUSTOM1", "CUSTOM2"])
    ).toBeUndefined();
    expect(
      HttpMethods.matched("Custom", ["CUSTOM1", "CUSTOM2"])
    ).toBeUndefined();
    expect(
      HttpMethods.matched("custom", ["CUSTOM1", "CUSTOM2"])
    ).toBeUndefined();
  });

  it("should not match custom methods without custom list", async () => {
    expect(HttpMethods.matched("CUSTOM1")).toBeUndefined();
    expect(HttpMethods.matched("CUSTOM2")).toBeUndefined();
  });

  it("should compare methods", async () => {
    expect(HttpMethods.equal(undefined, undefined)).toBeTruthy();
    expect(HttpMethods.equal("", "")).toBeTruthy();
    expect(HttpMethods.equal("", undefined)).toBeTruthy();
    expect(HttpMethods.equal("POST", undefined)).toBeFalsy();

    expect(HttpMethods.equal("post", "POST")).toBeTruthy();
    expect(HttpMethods.equal("post", "Post")).toBeTruthy();
    expect(HttpMethods.equal("Post", "post")).toBeTruthy();
    expect(HttpMethods.equal("POST", "post")).toBeTruthy();
    expect(HttpMethods.equal("POST", "post1")).toBeFalsy();
    expect(HttpMethods.equal("POST", "GET")).toBeFalsy();
  });
});
