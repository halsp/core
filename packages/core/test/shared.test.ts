import {
  addLeadingSlash,
  isArrayEmpty,
  isFunction,
  isNil,
  isNilOrBlank,
  isNumber,
  isObject,
  isPlainObject,
  isString,
  isSymbol,
  isUndefined,
  normalizePath,
  TestStartup,
} from "../src";

test("isNil", async function () {
  expect(isNil(undefined)).toBeTruthy();
  expect(isNil(null)).toBeTruthy();

  expect(isNil(false)).toBeFalsy();
  expect(isNil("")).toBeFalsy();
  expect(isNil(0)).toBeFalsy();
  expect(isNil({})).toBeFalsy();
});

test("isUndefined", async function () {
  expect(isUndefined(undefined)).toBeTruthy();

  expect(isUndefined({})).toBeFalsy();
});

test("isFunction", async function () {
  expect(isFunction(() => 0)).toBeTruthy();

  expect(isFunction(undefined)).toBeFalsy();
  expect(isFunction(null)).toBeFalsy();
  expect(isFunction({})).toBeFalsy();
});

test("isObject", async function () {
  expect(isObject({})).toBeTruthy();
  expect(isObject([1, 2])).toBeTruthy();
  expect(isObject(new TestStartup())).toBeTruthy();

  expect(isObject(() => 0)).toBeFalsy();
  expect(isObject(1)).toBeFalsy();
  expect(isObject(null)).toBeFalsy();
  expect(isObject(undefined)).toBeFalsy();
});

test("isPlainObject", async function () {
  expect(isPlainObject({})).toBeTruthy();
  expect(isPlainObject({ a: "a" })).toBeTruthy();
  expect(isPlainObject(Object.create(null))).toBeTruthy();
  expect(isPlainObject({ c: () => 0 })).toBeTruthy();

  expect(isPlainObject(Object.create({ b: 1 }))).toBeFalsy();
  expect(isPlainObject(null)).toBeFalsy();
  expect(isPlainObject(undefined)).toBeFalsy();
  expect(isPlainObject(2)).toBeFalsy();
  expect(isPlainObject([0, 1])).toBeFalsy();
  expect(isPlainObject(() => 0)).toBeFalsy();
  expect(
    isPlainObject(function () {
      return 0;
    })
  ).toBeFalsy();
  expect(isPlainObject(new TestStartup())).toBeFalsy();
});

test("isString", async function () {
  expect(isString("a")).toBeTruthy();

  expect(isString({})).toBeFalsy();
  expect(isString(null)).toBeFalsy();
  expect(isString(undefined)).toBeFalsy();
  expect(isString(true)).toBeFalsy();
  expect(isString(new String("a"))).toBeFalsy();
});

test("isSymbol", async function () {
  expect(isSymbol(Symbol("a"))).toBeTruthy();

  expect(isSymbol(null)).toBeFalsy();
  expect(isSymbol(undefined)).toBeFalsy();
  expect(isSymbol(true)).toBeFalsy();
  expect(isSymbol("a")).toBeFalsy();
});

test("isNumber", async function () {
  expect(isNumber(0)).toBeTruthy();
  expect(isNumber(0.1)).toBeTruthy();
  expect(isNumber(3.14)).toBeTruthy();
  expect(isNumber(1e-10)).toBeTruthy();
  expect(isNumber(0xff)).toBeTruthy();
  expect(isNumber(0o1)).toBeTruthy();
  expect(isNumber(0b1)).toBeTruthy();
  expect(isNumber(NaN)).toBeTruthy();

  expect(isNumber(null)).toBeFalsy();
  expect(isNumber(undefined)).toBeFalsy();
  expect(isNumber(true)).toBeFalsy();
  expect(isNumber("0")).toBeFalsy();
});

test("isArrayEmpty", async function () {
  expect(isArrayEmpty([])).toBeTruthy();
  expect(isArrayEmpty(null)).toBeTruthy();
  expect(isArrayEmpty(undefined)).toBeTruthy();

  expect(isArrayEmpty([0])).toBeFalsy();
  expect(isArrayEmpty(["0", "1"])).toBeFalsy();
});

test("isNilOrBlank", async function () {
  expect(isNilOrBlank("")).toBeTruthy();
  expect(isNilOrBlank(" ")).toBeTruthy();
  expect(isNilOrBlank("     ")).toBeTruthy();
  expect(isNilOrBlank(null)).toBeTruthy();
  expect(isNilOrBlank(undefined)).toBeTruthy();

  expect(isNilOrBlank(" 0 ")).toBeFalsy();
  expect(isNilOrBlank("a")).toBeFalsy();
});

test("addLeadingSlash ", async function () {
  expect(addLeadingSlash("a")).toBe("/a");
  expect(addLeadingSlash("/a")).toBe("/a");

  expect(addLeadingSlash("")).toBe("/");
  expect(addLeadingSlash(null)).toBe("/");
  expect(addLeadingSlash(undefined)).toBe("/");
});

test("normalizePath ", async function () {
  expect(normalizePath("path/")).toBe("path");
  expect(normalizePath("path///")).toBe("path");
  expect(normalizePath("/p/path///")).toBe("p/path");
  expect(normalizePath("path/", true)).toBe("/path");
  expect(normalizePath("///path/")).toBe("path");
  expect(normalizePath("///")).toBe("");
  expect(normalizePath("///p///path///")).toBe("p/path");

  expect(normalizePath("")).toBe("");
  expect(normalizePath("", true)).toBe("/");
  expect(normalizePath(null)).toBe("");
  expect(normalizePath(undefined)).toBe("");
});
