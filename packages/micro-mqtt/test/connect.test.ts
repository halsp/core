import { MicroMqttStartup } from "../src";

describe("connect", () => {
  it("should connect with servers", async () => {
    const startup = new MicroMqttStartup({
      servers: [
        {
          host: "127.0.0.1",
          port: 6002,
        },
      ],
    });
    await startup.listen();

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await startup.close(true);
  });
});
