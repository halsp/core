import { getClassProptotype } from "../src";

describe("proptotype", () => {
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
  });
});
