import { MicroTcpOptions, MicroTcpStartup } from "../src";
import { sendMessage } from "./utils";

describe("startup.listen", () => {
  it("should listen and close", async () => {
    const startup = new MicroTcpStartup();
    const { port } = await startup.dynamicListen();
    expect(port && port > 0).toBeTruthy();

    startup.close();
  });

  it("should listen port 23333", async () => {
    const opts: MicroTcpOptions = {
      port: 23333,
    };
    const server = new MicroTcpStartup(opts).listen();
    server.close();
  });
});

describe("parse message", () => {
  it("should set default result", async () => {
    const startup = new MicroTcpStartup();
    const { port } = await startup.dynamicListen();
    const result = await sendMessage(port as number, true);
    await startup.close();

    expect(result).toEqual({
      id: "123",
      body: undefined,
    });
  });
});
