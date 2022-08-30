import { getRules, V } from "../src";

describe("rules", () => {
  it("should return empty rules if target is null", async () => {
    const rules = getRules(null);
    expect(rules).toEqual([]);
  });

  it("should return rules with property filter", async () => {
    class TestClass {
      @V().IsString()
      prop!: string;
    }

    expect(getRules(TestClass).length).toBe(1);
    expect(getRules(TestClass, "prop").length).toBe(1);
    expect(getRules(TestClass, "prop1").length).toBe(0);
  });

  it("should return rules with object", async () => {
    class TestClass {
      @V().IsString()
      prop!: string;
    }

    expect(getRules(new TestClass()).length).toBe(1);
  });

  it("should return rules with parameter", async () => {
    class TestClass {
      constructor(@V().IsString() private readonly prop: string) {}
    }

    expect(getRules(TestClass).length).toBe(1);
    expect(getRules(TestClass, 0).length).toBe(1);
    expect(getRules(TestClass, 1).length).toBe(0);
  });
});
