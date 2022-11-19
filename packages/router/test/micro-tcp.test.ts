import { TestMicroTcpStartup } from "@ipare/testing/dist/micro-tcp";
import "./utils-micro";
import { MicroTcpClient } from "@ipare/micro-tcp-client";

describe("micro-nats", () => {
  it("should add pattern handlers when use micro tcp", async () => {
    const startup = new TestMicroTcpStartup()
      .useTestRouter(null as any)
      .useRouter();
    startup.listen();

    const client = new MicroTcpClient();
    await client.connect();

    const result = await client.send("event:123", true);

    await startup.close();
    await client.dispose();

    expect(result.data).toBe("event-pattern-test");
  });

  it("should match pattern with prefix", async () => {
    const startup = new TestMicroTcpStartup()
      .useTestRouter({
        prefix: "pf:",
      })
      .useRouter();
    startup.listen();

    const client = new MicroTcpClient();
    await client.connect();

    const result = await client.send("pf:event:123", true);

    await startup.close();
    await client.dispose();

    expect(result.data).toBe("event-pattern-test");
  });
});
