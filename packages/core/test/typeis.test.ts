import {
  addLeadingSlash,
  isArrayEmpty,
  isClass,
  isFiniteNumber,
  isFunction,
  isNil,
  isNilOrBlank,
  isNull,
  isNumber,
  isObject,
  isPlainObject,
  isString,
  isSymbol,
  isUndefined,
  normalizePath,
  TestStartup,
} from "../src";

test("isNil", async () => {
  expect(isNil(undefined)).toBeTruthy();
  expect(isNil(null)).toBeTruthy();

  expect(isNil(false)).toBeFalsy();
  expect(isNil("")).toBeFalsy();
  expect(isNil(0)).toBeFalsy();
  expect(isNil({})).toBeFalsy();
});

test("isUndefined", async () => {
  expect(isUndefined(undefined)).toBeTruthy();

  expect(isUndefined(null)).toBeFalsy();
  expect(isUndefined({})).toBeFalsy();
  expect(isUndefined(0)).toBeFalsy();
});

test("isNull", async () => {
  expect(isNull(null)).toBeTruthy();

  expect(isNull(undefined)).toBeFalsy();
  expect(isNull({})).toBeFalsy();
  expect(isNull(0)).toBeFalsy();
});

test("isFunction", async () => {
  expect(isFunction(() => 0)).toBeTruthy();

  expect(isFunction(undefined)).toBeFalsy();
  expect(isFunction(null)).toBeFalsy();
  expect(isFunction({})).toBeFalsy();
});

test("isObject", async () => {
  expect(isObject({})).toBeTruthy();
  expect(isObject([1, 2])).toBeTruthy();
  expect(isObject(new TestStartup())).toBeTruthy();

  expect(isObject(() => 0)).toBeFalsy();
  expect(isObject(1)).toBeFalsy();
  expect(isObject(null)).toBeFalsy();
  expect(isObject(undefined)).toBeFalsy();
});

test("isPlainObject", async () => {
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

test("isString", async () => {
  expect(isString("a")).toBeTruthy();

  expect(isString({})).toBeFalsy();
  expect(isString(null)).toBeFalsy();
  expect(isString(undefined)).toBeFalsy();
  expect(isString(true)).toBeFalsy();
  expect(isString(new String("a"))).toBeFalsy();
});

test("isSymbol", async () => {
  expect(isSymbol(Symbol("a"))).toBeTruthy();

  expect(isSymbol(null)).toBeFalsy();
  expect(isSymbol(undefined)).toBeFalsy();
  expect(isSymbol(true)).toBeFalsy();
  expect(isSymbol("a")).toBeFalsy();
});

test("isNumber", async () => {
  expect(isNumber(0)).toBeTruthy();
  expect(isNumber(0.1)).toBeTruthy();
  expect(isNumber(3.14)).toBeTruthy();
  expect(isNumber(1e-10)).toBeTruthy();
  expect(isNumber(0xff)).toBeTruthy();
  expect(isNumber(0o1)).toBeTruthy();
  expect(isNumber(0b1)).toBeTruthy();
  expect(isNumber(NaN)).toBeTruthy();
  expect(isNumber(Infinity)).toBeTruthy();

  expect(isNumber(null)).toBeFalsy();
  expect(isNumber(undefined)).toBeFalsy();
  expect(isNumber(true)).toBeFalsy();
  expect(isNumber("0")).toBeFalsy();
});

test("isFiniteNumber", async () => {
  expect(isFiniteNumber(0)).toBeTruthy();
  expect(isFiniteNumber(0.1)).toBeTruthy();
  expect(isFiniteNumber(3.14)).toBeTruthy();
  expect(isFiniteNumber(1e-10)).toBeTruthy();
  expect(isFiniteNumber(0xff)).toBeTruthy();
  expect(isFiniteNumber(0o1)).toBeTruthy();
  expect(isFiniteNumber(0b1)).toBeTruthy();

  expect(isFiniteNumber(NaN)).toBeFalsy();
  expect(isFiniteNumber(Infinity)).toBeFalsy();
  expect(isFiniteNumber(null)).toBeFalsy();
  expect(isFiniteNumber(undefined)).toBeFalsy();
  expect(isFiniteNumber(true)).toBeFalsy();
  expect(isFiniteNumber("0")).toBeFalsy();
});

test("isArrayEmpty", async () => {
  expect(isArrayEmpty([])).toBeTruthy();
  expect(isArrayEmpty(null)).toBeTruthy();
  expect(isArrayEmpty(undefined)).toBeTruthy();

  expect(isArrayEmpty([0])).toBeFalsy();
  expect(isArrayEmpty(["0", "1"])).toBeFalsy();
});

test("isNilOrBlank", async () => {
  expect(isNilOrBlank("")).toBeTruthy();
  expect(isNilOrBlank(" ")).toBeTruthy();
  expect(isNilOrBlank("     ")).toBeTruthy();
  expect(isNilOrBlank(null)).toBeTruthy();
  expect(isNilOrBlank(undefined)).toBeTruthy();

  expect(isNilOrBlank(" 0 ")).toBeFalsy();
  expect(isNilOrBlank("a")).toBeFalsy();
});

test("addLeadingSlash ", async () => {
  expect(addLeadingSlash("a")).toBe("/a");
  expect(addLeadingSlash("/a")).toBe("/a");

  expect(addLeadingSlash("")).toBe("/");
  expect(addLeadingSlash(null)).toBe("/");
  expect(addLeadingSlash(undefined)).toBe("/");
});

test("normalizePath ", async () => {
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

test("isClass", async () => {
  expect(isClass(TestStartup)).toBeTruthy();

  expect(isClass({})).toBeFalsy();
  expect(isClass(Object.create(null))).toBeFalsy();
  expect(isClass(Object.create({ b: 1 }))).toBeFalsy();
  expect(isClass(null)).toBeFalsy();
  expect(isClass(undefined)).toBeFalsy();
  expect(isClass(2)).toBeFalsy();
  expect(isClass([0, 1])).toBeFalsy();
  expect(isClass(() => 0)).toBeFalsy();
  expect(
    isClass(function () {
      return 0;
    })
  ).toBeFalsy();
  expect(isClass(new TestStartup())).toBeFalsy();
});
