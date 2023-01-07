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

    let error: any;
    try {
      await client.send("", "", undefined, 1000);
    } catch (err) {
      error = err;
    }
    expect(error.message).toBe("Send timeout");
  });
});
