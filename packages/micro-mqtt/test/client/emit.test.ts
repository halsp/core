import { MicroMqttClient } from "../../src";

describe("emit", () => {
  it("should not emit message before connect", async () => {
    const client = new MicroMqttClient();

    let error: any;
    try {
      client.emit("", "");
    } catch (err) {
      error = err;
    }
    expect(error.message).toBe("The connection is not connected");
  });

  it("should not emit message if connected is false", async () => {
    const client = new MicroMqttClient();
    (client as any).client = {
      connected: false,
    };

    let error: any;
    try {
      client.emit("", "");
    } catch (err) {
      error = err;
    }
    expect(error.message).toBe("The connection is not connected");
  });

  it("should emit message when connected", async () => {
    let published = false;
    const client = new MicroMqttClient();
    (client as any).client = {
      connected: true,
      publish: () => {
        published = true;
      },
    };

    client.emit("", "");
    expect(published).toBeTruthy();
  });
});
