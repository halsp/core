import { MicroNatsClient, MicroNatsStartup } from "../src";
import { mockConnection, mockConnectionFrom } from "../src/mock";
import * as nats from "nats";

describe("error", () => {
  it("should log error when err arguments in startup callback is defined", async () => {
    const pattern = nats.createInbox();

    const startup = new MicroNatsStartup().pattern(pattern, () => undefined);
    mockConnection.bind(startup)();
    await startup.listen();

    const publish = (startup as any).connection.publish;
    (startup as any).connection.publish = (
      subject: string,
      data?: Uint8Array,
      options?: nats.PublishOptions
    ) => {
      return publish(subject, data, { ...options, err: "err" } as any);
    };

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        resolve();
      }, 500);
    });

    const client = new MicroNatsClient();
    mockConnectionFrom.bind(client)(startup);
    await client.connect();

    const beforeError = console.error;
    let err = false;
    console.error = () => {
      err = true;
    };
    const waitResult = await new Promise(async (resolve) => {
      setTimeout(async () => {
        resolve(true);
      }, 1000);

      await client.send(pattern, true, undefined, 1000);

      resolve(false);
    });
    console.error = beforeError;

    await startup.close();
    await client.dispose();

    expect(err).toBeTruthy();
    expect(waitResult).toBeTruthy();
  });

  it("should log error when err arguments in client callback is defined", async () => {
    const pattern = nats.createInbox();

    const startup = new MicroNatsStartup().pattern(pattern, () => undefined);
    mockConnection.bind(startup)();
    await startup.listen();

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        resolve();
      }, 500);
    });

    const client = new MicroNatsClient();
    mockConnectionFrom.bind(client)(startup);
    await client.connect();

    const publish = (client as any).connection.publish;
    (client as any).connection.publish = (
      subject: string,
      data?: Uint8Array,
      options?: nats.PublishOptions
    ) => {
      return publish(subject, data, {
        ...options,
        resErr: new Error("err"),
      } as any);
    };

    const result = await client.send(pattern, true);

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        resolve();
      }, 500);
    });

    await startup.close();
    await client.dispose();

    expect(result.error).toBe("err");
  });
});
