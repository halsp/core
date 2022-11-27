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

  it("should connect with default host and port", async () => {
    const client = new MicroRedisStartup();
    await client.listen();

    expect((client as any)["sub"]["opt"]).toEqual({
      url: `redis://localhost:6379`,
    });
  });
});
