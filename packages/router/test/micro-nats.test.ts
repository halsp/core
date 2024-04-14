import "@halsp/testing";
import "@halsp/micro-nats/server";
import "./utils";
import { MicroNatsClient } from "@halsp/micro-nats/client";
import { Startup } from "@halsp/core";

describe("micro-nats", () => {
  it("should add pattern handlers when use micro nats", async () => {
    const startup = new Startup()
      .useMicroNats({
        port: 6001,
      })
      .useTestRouter()
      .useRouter();
    await startup.listen();

    const client = new MicroNatsClient({
      port: 6001,
    });
    await client["connect"]();

    const result = await client.send("event:123", { val: true });

    await startup.close();
    await client.dispose();

    expect(result).toBe("event-pattern-test");
  });

  it("should match pattern with prefix", async () => {
    const startup = new Startup()
      .useMicroNats({
        port: 6001,
      })
      .useTestRouter({
        prefix: "pf:",
      })
      .useRouter();
    await startup.listen();

    const client = new MicroNatsClient({
      port: 6001,
    });
    await client["connect"]();

    const result = await client.send("pf:event:123", { val: true });

    await startup.close();
    await client.dispose();

    expect(result).toBe("event-pattern-test");
  });
});
