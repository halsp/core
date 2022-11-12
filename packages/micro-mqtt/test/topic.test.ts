import { matchTopic } from "../src";

describe("match topic", () => {
  it("should match pattern with #", async () => {
    expect(matchTopic("a/#", "a/b")).toBeTruthy();
    expect(matchTopic("a/#", "a/b/c")).toBeTruthy();
  });

  it("should match pattern with +", async () => {
    expect(matchTopic("a/+", "a/b")).toBeTruthy();
    expect(matchTopic("+/b", "a/b")).toBeTruthy();
  });

  it("should not match pattern with +", async () => {
    expect(matchTopic("a/+", "a/b/c")).toBeFalsy();
  });
});
