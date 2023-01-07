import { MicroNatsClient } from "../src";

describe("send", () => {
  it("should not send message before connect", async () => {
    const client = new MicroNatsClient();

    let error: any;
    try {
      await client.send("", "");
    } catch (err) {
      error = err;
    }
    expect(error.message).toBe("The connection is not connected");
  });

  it("should not send message when connection is closed", async () => {
    const client = new MicroNatsClient();
    (client as any).connection = {
      isClosed: () => true,
      disconnect: () => undefined,
    };

    let error: any;
    try {
      await client.send("", "");
    } catch (err) {
      error = err;
    }
    expect(error.message).toBe("The connection is not connected");
  });
});
