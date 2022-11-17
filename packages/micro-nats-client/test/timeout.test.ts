import { MicroNatsClient } from "../src";

describe("timeout", () => {
  it("should return timeout without callback", async () => {
    const client = new MicroNatsClient();
    (client as any).connection = {
      isClosed: () => false,
      subscribe: () => {
        return {
          unsubscribe: () => undefined,
        };
      },
      unsubscribe: () => undefined,
      publish: () => undefined,
    };

    const result = await client.send("", "", undefined, 1000);
    expect(result.error).toBe("Send timeout");
  });
});
