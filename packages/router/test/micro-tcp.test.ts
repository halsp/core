import "@halsp/testing";
import "@halsp/micro-tcp/server";
import "./utils";
import { MicroTcpClient } from "@halsp/micro-tcp/client";
import { Startup } from "@halsp/core";

describe("micro-nats", () => {
  it("should add pattern handlers when use micro tcp", async () => {
    const startup = new Startup()
      .useMicroTcp({ port: 23331 })
      .useTestRouter(null as any)
      .useRouter();
    await startup.listen();

    const client = new MicroTcpClient({ port: 23331 });
    await client["connect"]();

    const result = await client.send("event:123", true);

    await client.dispose();
    await startup.close();

    expect(result).toBe("event-pattern-test");
  });

  it("should match pattern with prefix", async () => {
    const startup = new Startup()
      .useMicroTcp({ port: 23332 })
      .useTestRouter({
        prefix: "pf:",
      })
      .useRouter();
    await startup.listen();

    const client = new MicroTcpClient({ port: 23332 });
    await client["connect"]();

    const result = await client.send("pf:event:123", true);

    await client.dispose();
    await startup.close();

    expect(result).toBe("event-pattern-test");
  });
});
