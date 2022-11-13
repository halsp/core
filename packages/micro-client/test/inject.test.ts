import { TestStartup } from "@ipare/testing";
import "../src";
import { MicroTcpClient } from "../src";

describe("inject", () => {
  it("should inject micro client", async () => {
    new TestStartup()
      .useMicroTcp({
        port: 23378,
      })
      .use(async (ctx) => {
        const client = await ctx.getMicroClient<MicroTcpClient>();
        expect(!!client.logger).toBeTruthy();
      })
      .run();
  });
});
