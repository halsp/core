import { runin } from "@halsp/testing";
import { MicroGrpcClient } from "../src";

describe("client", () => {
  it("should load default protos", async () => {
    await runin("test", async () => {
      const client = new MicroGrpcClient();
      await client["connect"]();

      let err!: Error;
      try {
        await client.send("test/testService/testMethod");
      } catch (e) {
        err = e as Error;
      }
      expect(err.message).toBe("14 UNAVAILABLE: No connection established");

      err = undefined as any;
      try {
        await client.send("test/testService/testMethod1");
      } catch (e) {
        err = e as Error;
      }
      expect(err.message).toBe("The service or method is not exist");

      err = undefined as any;
      try {
        client.emit("test/testService");
      } catch (e) {
        err = e as Error;
      }
      expect(err.message).toBe("The service or method is not exist");

      await client.dispose();
    });
  }, 10000);

  it("should throw error when send data without connect", async () => {
    const client = new MicroGrpcClient({
      protoFiles: "./test/protos/test.proto",
    });

    let err!: Error;
    try {
      await client.send("test/testService/testMethod");
    } catch (e) {
      err = e as Error;
    }
    expect(err.message).toBe("Should invoke .connect() first");

    err = undefined as any;
    try {
      client.emit("test/testService/testMethod");
    } catch (e) {
      err = e as Error;
    }
    expect(err.message).toBe("Should invoke .connect() first");

    await client.dispose();
  });
});
