import { MicroRedisStartup } from "../src";

describe("connect", () => {
  jest.mock("redis", () => {
    return {
      createClient: (opt: any) => {
        return {
          opt,
          connect: () => undefined,
          subscribe: () => undefined,
        };
      },
    };
  });

  it("should create url for redis package", async () => {
    const client = new MicroRedisStartup({
      host: "127.0.0.1",
      port: 6000,
    });
    await client.listen();

    expect((client as any)["sub"]["opt"]).toEqual({
      url: `redis://127.0.0.1:6000`,
    });
  });

  it("should connect with default host and port", async () => {
    const client = new MicroRedisStartup();
    await client.listen();

    expect((client as any)["sub"]["opt"]).toEqual({
      url: `redis://localhost:6379`,
    });
  });
});
