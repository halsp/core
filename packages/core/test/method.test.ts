import { HttpMethod } from "../src";

test("http methods", async function () {
  expect(HttpMethod.post.toUpperCase()).toBe("POST");
  expect(HttpMethod.get.toUpperCase()).toBe("GET");
  expect(HttpMethod.any.toUpperCase()).toBe("ANY");
  expect(HttpMethod.delete.toUpperCase()).toBe("DELETE");
  expect(HttpMethod.patch.toUpperCase()).toBe("PATCH");
  expect(HttpMethod.connect.toUpperCase()).toBe("CONNECT");
  expect(HttpMethod.head.toUpperCase()).toBe("HEAD");
  expect(HttpMethod.options.toUpperCase()).toBe("OPTIONS");
  expect(HttpMethod.put.toUpperCase()).toBe("PUT");
});

test("http methods matched", async function () {
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
});

test("custom methods", async function () {
  HttpMethod.custom.push("CUSTOM1");
  HttpMethod.custom.push("CUSTOM2");

  expect(HttpMethod.matched("CUSTOM1")).toBe("CUSTOM1");
  expect(HttpMethod.matched("Custom1")).toBe("CUSTOM1");
  expect(HttpMethod.matched("custom1")).toBe("CUSTOM1");
  expect(HttpMethod.matched("CUSTOM1")).not.toBe("CUSTOM");

  expect(HttpMethod.matched("CUSTOM2")).toBe("CUSTOM2");
  expect(HttpMethod.matched("Custom2")).toBe("CUSTOM2");
  expect(HttpMethod.matched("custom2")).toBe("CUSTOM2");
  expect(HttpMethod.matched("CUSTOM2")).not.toBe("CUSTOM");

  expect(HttpMethod.matched("CUSTOM")).toBe(undefined);
  expect(HttpMethod.matched("Custom")).toBe(undefined);
  expect(HttpMethod.matched("custom")).toBe(undefined);
});

test("equal", async function () {
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
