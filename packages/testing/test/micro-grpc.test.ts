import { TestMicroGrpcStartup } from "../src/micro-grpc";
import { MicroGrpcClient } from "@ipare/micro-grpc-client";

describe("micro tcp startup", () => {
  it("should send message and return value", async () => {
    const startup = new TestMicroGrpcStartup({
      protoFiles: "./test/test.proto",
      port: 5080,
    })
      .use((ctx) => {
        ctx.res.setBody({
          resMessage: ctx.req.body.reqMessage,
        });
      })
      .pattern("test/TestService/testMethod", () => undefined);
    await startup.listen();

    const client = new MicroGrpcClient({
      protoFiles: "./test/test.proto",
      port: 5080,
    });
    await client.connect();
    const result = await client.send("test/TestService/testMethod", {
      reqMessage: "abc",
    });
    expect(result).toEqual({
      resMessage: "abc",
    });

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 5000));

    client.dispose();
    await startup.close();
  }, 10000);
});
