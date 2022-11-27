import { MicroNatsClient } from "../src";
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
    const client = new MicroNatsClient({
      host: "127.0.0.1",
      port: 4000,
    });
    await client.connect();

    expect((client as any)["connection"]["opt"]).toEqual({
      port: 4000,
      servers: "127.0.0.1",
    });
  });

  it("should connect with default host and port", async () => {
    const client = new MicroNatsClient();
    await client.connect();

    expect((client as any)["connection"]["opt"]).toEqual({
      port: 4222,
      servers: "localhost",
    });
  });
});
