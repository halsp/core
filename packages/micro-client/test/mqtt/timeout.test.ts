import { MicroMqttClient } from "../../src";

describe("timeout", () => {
  it("should return timeout without callback", async () => {
    const client = new MicroMqttClient();
    (client as any).client = {
      connected: true,
      subscribe: () => undefined,
      unsubscribe: () => undefined,
      publish: () => undefined,
    };

    const result = await client.send("", "", 1000);
    expect(result.error).toBe("Send timeout");
  });
});
