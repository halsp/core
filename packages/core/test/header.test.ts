import {
  getReasonPhrase,
  getStatusCode,
  HeadersDict,
  ReasonPhrases,
  SfaResponse,
  StatusCodes,
} from "../src";

test("setHeader", async () => {
  const req = new SfaResponse()
    .setHeader("h1", "1")
    .setHeader("h2", "2")
    .setHeader("h3", "3")
    .setHeader("h4", undefined as unknown as string);

  expectHeaders(req.headers);
});

test("setHeaders", async () => {
  const req = new SfaResponse().setHeaders({
    h1: "1",
    h2: "2",
    h3: "3",
  });
  expectHeaders(req.headers);
});

test("removeHeader", async () => {
  const res = new SfaResponse()
    .setHeader("h1", "1")
    .setHeader("h2", "2")
    .setHeader("h3", "3")
    .setHeader("h4", "4")
    .removeHeader("h4")
    .removeHeader("h5");

  expectHeaders(res.headers);
});

function expectHeaders(headers: HeadersDict) {
  expect(headers.h1).toBe("1");
  expect(headers.h2).toBe("2");
  expect(headers.h3).toBe("3");
  expect(headers.h4).toBe(undefined);
  expect(headers.h5).toBe(undefined);
}

test("array headers", async () => {
  const res = new SfaResponse().setHeaders({
    h1: 1,
    h2: ["2.1", 2.2],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h3: undefined as any,
  });
  expect(res.headers.h1).toBe("1");
  expect(res.headers.h2).toEqual(["2.1", "2.2"]);
  expect(res.headers.h3).toBeUndefined();
});

test("append header", async () => {
  const res = new SfaResponse()
    .appendHeader("h1", 1)
    .appendHeader("h1", "2")
    .appendHeader("h1", [3, "4"]);
  expect(res.headers.h1).toEqual(["1", "2", "3", "4"]);
});

test("status code", () => {
  expect(StatusCodes).not.toBeUndefined();
  expect(getStatusCode).not.toBeUndefined();
  expect(ReasonPhrases).not.toBeUndefined();
  expect(getReasonPhrase).not.toBeUndefined();
});
