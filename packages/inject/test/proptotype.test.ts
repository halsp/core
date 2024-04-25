import { getClassConstractor, getClassProptotype } from "../src";

describe("get class proptotype", () => {
  it("should return proptotype when param is class decorator", () => {
    class TestClass {}
    expect(getClassProptotype(TestClass)).toBe(TestClass.prototype);
  });

  it("should return itself when param is prototype", () => {
    class TestClass {}
    expect(getClassProptotype(TestClass.prototype)).toBe(TestClass.prototype);
  });

  it("should return itself when param is basic type", () => {
    expect(getClassProptotype(Number)).toBe(Number);
    expect(getClassProptotype(String)).toBe(String);
    expect(getClassProptotype(String.prototype)).toBe(String.prototype);
    expect(getClassProptotype(Number.prototype)).toBe(Number.prototype);
  });
});

describe("get class constructor", () => {
  it("should return constructor when param is class prototype", () => {
    class TestClass {}
    expect(getClassConstractor(TestClass.prototype)).toBe(TestClass);
  });

  it("should return itself when param is constructor", () => {
    class TestClass {}
    expect(getClassConstractor(TestClass)).toBe(TestClass);
  });

  it("should return itself when param is basic type", () => {
    expect(getClassConstractor(Number.prototype)).toBe(Number.prototype);
    expect(getClassConstractor(String.prototype)).toBe(String.prototype);
    expect(getClassConstractor(String)).toBe(String);
    expect(getClassConstractor(Number)).toBe(Number);
  });
});
