import { MicroNatsStartup } from "../src";
import { JSONCodec } from "@ipare/testing/dist/micro-nats";

describe("connect", () => {
  jest.mock("nats", () => {
    return {
      connect: (opt: any) => {
        return {
          opt,
        };
      },
      JSONCodec: JSONCodec,
    };
  });

  it("should create url for nats package", async () => {
    const startup = new MicroNatsStartup({
      host: "127.0.0.1",
      port: 4000,
    });
    await startup.listen();

    expect((startup as any)["connection"]["opt"]).toEqual({
      services: "127.0.0.1",
      port: 4000,
    });
  });

  it("should connect with default host and port", async () => {
    const startup = new MicroNatsStartup();
    await startup.listen();

    expect((startup as any)["connection"]["opt"]).toEqual({
      services: "localhost",
      port: 4222,
    });
  });
});
