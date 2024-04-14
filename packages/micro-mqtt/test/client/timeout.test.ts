import { MicroMqttClient } from "../../src/client";

describe("timeout", () => {
  it("should return timeout without callback", async () => {
    const client = new MicroMqttClient();
    (client as any).client = {
      connected: true,
      subscribe: () => undefined,
      unsubscribe: () => undefined,
      publish: () => undefined,
    };

    let error: any;
    try {
      await client.send("", "", {
        timeout: 1000,
      });
    } catch (err) {
      error = err;
    }
    expect(error.message).toBe("Send timeout");
  });
});
