import { MicroMqttClient } from "../../src";

describe("send", () => {
  it("should not send message before connect", async () => {
    const client = new MicroMqttClient();
    const result = await client.send("", "");
    await client.dispose();
    expect(result.error).toBe("The connection is not connected");
  });

  it("should not send message if client is not connected", async () => {
    const client = new MicroMqttClient();
    (client as any).client = {
      connected: false,
      end: () => undefined,
      removeAllListeners: () => undefined,
    };
    const result = await client.send("", "");
    await client.dispose();
    expect(result.error).toBe("The connection is not connected");
  });

  it("should get data from return packet", async () => {
    const client = new MicroMqttClient();
    expect(
      client["getDataFromReturnPacket"]({
        data: "data",
      })
    ).toBe("data");
    expect(
      client["getDataFromReturnPacket"]({
        response: "res",
      })
    ).toBe("res");
  });
});
