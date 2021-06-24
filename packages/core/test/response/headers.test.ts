import { Response } from "../../src";

test("response setHeader", async function () {
  const res = new Response()
    .setHeader("h1", "1")
    .setHeader("h2", "2")
    .setHeader("h3", "3")
    .removeHeader("h2")
    .removeHeader("h4");

  expectHeaders(res.headers);
});

test("response setHeaders", async function () {
  const res = new Response().setHeaders({
    h1: "1",
    h3: "3",
  });
  expectHeaders(res.headers);
});

function expectHeaders(headers: Record<string, string | string[] | undefined>) {
  expect(headers.h1).toBe("1");
  expect(headers.h2).toBe(undefined);
  expect(headers.h3).toBe("3");
  expect(headers.h4).toBe(undefined);
}

test("get headers", async function () {
  const res = new Response().setHeaders({
    h1: 1,
    h2: ["2.1", 2.2],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h3: undefined as any,
  });
  expect(res.headers.h1).toBe("1");
  expect(res.headers.h2).toEqual(["2.1", "2.2"]);
  expect(res.headers.h3).toBeUndefined();
});

test("append header", async function () {
  const res = new Response()
    .appendHeader("h1", 1)
    .appendHeader("h1", "2")
    .appendHeader("h1", [3, "4"]);
  expect(res.headers.h1).toEqual(["1", "2", "3", "4"]);
});
