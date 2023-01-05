import { Context } from "@ipare/core";
import { TestMicroMqttStartup } from "../src/micro-mqtt";

describe("micro-mqtt", () => {
  jest.mock("mqtt", () => {
    return {
      connect: (opt: any) => {
        return {
          opt,
          on: (event: string, cb: any) => {
            if (event == "connect") {
              setTimeout(() => cb(), 500);
            }
          },
          subscribe: () => undefined,
        };
      },
    };
  });

  it("should subscribe and publish", async () => {
    const startup = new TestMicroMqttStartup()
      .pattern("test_pattern", () => undefined)
      .use((ctx) => {
        ctx.res.body = "test";
      });
    const res = await startup["invoke"](new Context());
    expect(res.body).toBe("test");
  });
});
