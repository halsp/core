import { MicroNatsClient } from "../../src";

describe("send", () => {
  it("should not send message before connect", async () => {
    const client = new MicroNatsClient();
    const result = await client.send("", "");
    await client.dispose();
    expect(result.error).toBe("The connection is not connected");
  });

  it("should not send message if sub.isReady is false", async () => {
    const client = new MicroNatsClient();
    (client as any).sub = {
      isReady: true,
      isOpen: true,
      disconnect: () => undefined,
    };
    const result = await client.send("", "");
    await client.dispose();
    expect(result.error).toBe("The connection is not connected");
  });

  it("should not send message if hub.isReady is false", async () => {
    const client = new MicroNatsClient();
    (client as any).sub = {
      isReady: true,
    };
    (client as any).pub = {
      isReady: false,
    };
    const result = await client.send("", "");
    await client.dispose();
    expect(result.error).toBe("The connection is not connected");
  });
});
