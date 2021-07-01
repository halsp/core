import isPlainObj from "../src/utils/isPlainObj";

test("isPlainObj", async function () {
  class Test {}

  expect(isPlainObj({})).toBeTruthy();
  expect(
    isPlainObj({
      a: 1,
    })
  ).toBeTruthy();
  expect(isPlainObj(() => void 0)).toBeFalsy();
  expect(isPlainObj(1)).toBeFalsy();
  expect(isPlainObj("1")).toBeFalsy();
  expect(isPlainObj(true)).toBeFalsy();
  expect(isPlainObj(true)).toBeFalsy();
  expect(
    isPlainObj(function () {
      //
    })
  ).toBeFalsy();
  expect(isPlainObj(new Test())).toBeFalsy();
});
