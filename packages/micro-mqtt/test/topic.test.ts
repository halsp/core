import { matchTopic } from "../src/server/topic";

describe("match topic", () => {
  it("should not match topic", async () => {
    expect(matchTopic("a/b", "a/c")).toBeFalsy();
  });

  it("should match topic with #", async () => {
    expect(matchTopic("a/#", "a/b")).toBeTruthy();
    expect(matchTopic("a/#", "a/b/c")).toBeTruthy();
  });

  it("should match topic with +", async () => {
    expect(matchTopic("a/+", "a/b")).toBeTruthy();
    expect(matchTopic("+/b", "a/b")).toBeTruthy();
  });

  it("should not match topic with +", async () => {
    expect(matchTopic("a/+", "a/b/c")).toBeFalsy();
  });
});
