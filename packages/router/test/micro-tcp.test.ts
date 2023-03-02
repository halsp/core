import { TestMicroTcpStartup } from "@halsp/testing/dist/micro-tcp";
import "./utils-micro";
import { MicroTcpClient } from "@halsp/micro-tcp-client";

describe("micro-nats", () => {
  it("should add pattern handlers when use micro tcp", async () => {
    const startup = new TestMicroTcpStartup()
      .useTestRouter(null as any)
      .useRouter();
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({ port });
    await client["connect"]();

    const result = await client.send("event:123", true);

    await client.dispose();
    await startup.close();

    expect(result).toBe("event-pattern-test");
  });

  it("should match pattern with prefix", async () => {
    const startup = new TestMicroTcpStartup()
      .useTestRouter({
        prefix: "pf:",
      })
      .useRouter();
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({ port });
    await client["connect"]();

    const result = await client.send("pf:event:123", true);

    await client.dispose();
    await startup.close();

    expect(result).toBe("event-pattern-test");
  });
});
