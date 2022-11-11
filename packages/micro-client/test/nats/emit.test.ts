import { MicroNatsClient } from "../../src";

describe("emit", () => {
  it("should not emit message before connect", async () => {
    const client = new MicroNatsClient();

    let error: any;
    try {
      client.emit("", "");
    } catch (err) {
      error = err;
    }
    expect(error.message).toBe("The connection is not connected");
  });

  it("should not emit message if pub.isClosed is false", async () => {
    const client = new MicroNatsClient();
    (client as any).pub = {
      isClosed: () => true,
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
    const client = new MicroNatsClient();
    (client as any).connection = {
      isClosed: () => false,
      publish: () => {
        published = true;
      },
    };

    client.emit("", "");
    expect(published).toBeTruthy();
  });
});
