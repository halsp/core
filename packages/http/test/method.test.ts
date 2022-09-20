import { HttpMethod } from "../src";

test("http methods", async () => {
  expect(HttpMethod.post.toUpperCase()).toBe("POST");
  expect(HttpMethod.get.toUpperCase()).toBe("GET");
  expect(HttpMethod.any.toUpperCase()).toBe("ANY");
  expect(HttpMethod.delete.toUpperCase()).toBe("DELETE");
  expect(HttpMethod.patch.toUpperCase()).toBe("PATCH");
  expect(HttpMethod.connect.toUpperCase()).toBe("CONNECT");
  expect(HttpMethod.head.toUpperCase()).toBe("HEAD");
  expect(HttpMethod.options.toUpperCase()).toBe("OPTIONS");
  expect(HttpMethod.put.toUpperCase()).toBe("PUT");
  expect(HttpMethod.move.toUpperCase()).toBe("MOVE");
  expect(HttpMethod.copy.toUpperCase()).toBe("COPY");
  expect(HttpMethod.link.toUpperCase()).toBe("LINK");
  expect(HttpMethod.unlink.toUpperCase()).toBe("UNLINK");
  expect(HttpMethod.wrapped.toUpperCase()).toBe("WRAPPED");
});

test("http methods matched", async () => {
  expect(HttpMethod.matched("")).toBe(undefined);
  expect(HttpMethod.matched("get")).toBe("GET");
  expect(HttpMethod.matched("Post")).toBe("POST");
  expect(HttpMethod.matched("PUT")).toBe("PUT");
  expect(HttpMethod.matched("DELETE")).toBe("DELETE");
  expect(HttpMethod.matched("PATCH")).toBe("PATCH");
  expect(HttpMethod.matched("ANY")).toBe("ANY");
  expect(HttpMethod.matched("HEAD")).toBe("HEAD");
  expect(HttpMethod.matched("OPTIONS")).toBe("OPTIONS");
  expect(HttpMethod.matched("TRACE")).toBe("TRACE");
  expect(HttpMethod.matched("CONNECT")).toBe("CONNECT");
  expect(HttpMethod.matched("MOVE")).toBe("MOVE");
  expect(HttpMethod.matched("COPY")).toBe("COPY");
  expect(HttpMethod.matched("LINK")).toBe("LINK");
  expect(HttpMethod.matched("UNLINK")).toBe("UNLINK");
  expect(HttpMethod.matched("WRAPPED")).toBe("WRAPPED");
});

test("custom methods", async () => {
  process.env.CUSTOM_METHODS = "CUSTOM1,CUSTOM2";

  expect(HttpMethod.matched("CUSTOM1", ["CUSTOM1", "CUSTOM2"])).toBe("CUSTOM1");
  expect(HttpMethod.matched("Custom1", ["CUSTOM1", "CUSTOM2"])).toBe("CUSTOM1");
  expect(HttpMethod.matched("custom1", ["CUSTOM1", "CUSTOM2"])).toBe("CUSTOM1");

  expect(HttpMethod.matched("CUSTOM2", ["CUSTOM1", "CUSTOM2"])).toBe("CUSTOM2");
  expect(HttpMethod.matched("Custom2", ["CUSTOM1", "CUSTOM2"])).toBe("CUSTOM2");
  expect(HttpMethod.matched("custom2", ["CUSTOM1", "CUSTOM2"])).toBe("CUSTOM2");

  expect(HttpMethod.matched("CUSTOM", ["CUSTOM1", "CUSTOM2"])).toBeUndefined();
  expect(HttpMethod.matched("Custom", ["CUSTOM1", "CUSTOM2"])).toBeUndefined();
  expect(HttpMethod.matched("custom", ["CUSTOM1", "CUSTOM2"])).toBeUndefined();
});

test("custom methods null", async () => {
  process.env.CUSTOM_METHODS = undefined;

  expect(HttpMethod.matched("CUSTOM1")).toBeUndefined();
  expect(HttpMethod.matched("CUSTOM2")).toBeUndefined();
});

test("equal", async () => {
  expect(HttpMethod.equal(undefined, undefined)).toBeTruthy();
  expect(HttpMethod.equal("", "")).toBeTruthy();
  expect(HttpMethod.equal("", undefined)).toBeTruthy();
  expect(HttpMethod.equal("POST", undefined)).toBeFalsy();

  expect(HttpMethod.equal("post", "POST")).toBeTruthy();
  expect(HttpMethod.equal("post", "Post")).toBeTruthy();
  expect(HttpMethod.equal("Post", "post")).toBeTruthy();
  expect(HttpMethod.equal("POST", "post")).toBeTruthy();
  expect(HttpMethod.equal("POST", "post1")).toBeFalsy();
  expect(HttpMethod.equal("POST", "GET")).toBeFalsy();
});
