import { MicroMqttClient } from "../src";

describe("send", () => {
  it("should not send message before connect", async () => {
    const client = new MicroMqttClient();

    let error: any;
    try {
      await client.send("", "");
    } catch (err) {
      error = err;
    }

    await client.dispose();
    expect(error.message).toBe("The connection is not connected");
  });

  it("should not send message if client is not connected", async () => {
    const client = new MicroMqttClient();
    (client as any).client = {
      connected: false,
      end: (force: any, obj: any, cb: any) => cb(),
      removeAllListeners: () => undefined,
    };

    let error: any;
    try {
      await client.send("", "");
    } catch (err) {
      error = err;
    }
    await client.dispose();

    expect(error.message).toBe("The connection is not connected");
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
