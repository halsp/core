import { getStatusCode, getReasonPhrase } from "../../src/utils";

test(`getStatusCode`, async function () {
  expect(getStatusCode("Bad Request")).toBe(400);
});

test(`getReasonPhrase`, async function () {
  expect(getReasonPhrase(400)).toBe("Bad Request");
});
