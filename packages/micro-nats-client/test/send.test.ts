import { MicroNatsClient } from "../src";

describe("send", () => {
  it("should not send message before connect", async () => {
    const client = new MicroNatsClient();
    const result = await client.send("", "");
    await client.dispose();
    expect(result.error).toBe("The connection is not connected");
  });

  it("should not send message when connection is closed", async () => {
    const client = new MicroNatsClient();
    (client as any).connection = {
      isClosed: () => true,
      disconnect: () => undefined,
    };
    const result = await client.send("", "");
    await client.dispose();
    expect(result.error).toBe("The connection is not connected");
  });
});
