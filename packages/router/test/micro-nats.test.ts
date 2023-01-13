import { TestMicroNatsStartup } from "@ipare/testing/dist/micro-nats";
import "./utils-micro";
import { MicroNatsClient } from "@ipare/micro-nats-client";

describe("micro-nats", () => {
  it("should add pattern handlers when use micro nats", async () => {
    const startup = new TestMicroNatsStartup({
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

    expect(result.data).toBe("event-pattern-test");
  });

  it("should match pattern with prefix", async () => {
    const startup = new TestMicroNatsStartup({
      port: 6001,
    })
      .useTestRouter({
        prefix: "pf:",
      })
      .useRouter();
    startup.listen();

    const client = new MicroNatsClient({
      port: 6001,
    });
    await client["connect"]();

    const result = await client.send("pf:event:123", { val: true });

    await startup.close();
    await client.dispose();

    expect(result.data).toBe("event-pattern-test");
  });
});
