import { MicroGrpcStartup } from "../src";
import * as grpc from "@grpc/grpc-js";
import * as grpcLoader from "@grpc/proto-loader";
import { Request } from "@ipare/core";

describe("stream", () => {
  it("should handle server stream message", async () => {
    let req!: Request;
    const startup = new MicroGrpcStartup({
      protoFiles: "./test/protos/stream.server.proto",
    })
      .pattern("serverStream.ServerStreamService/testMethod", (ctx) => {
        ctx.res.setBody({
          resMessage: ctx.req.body.reqMessage,
        });
      })
      .use((ctx) => {
        req = ctx.req;
      });
    await startup.listen();

    const definition = await grpcLoader.load(
      "./test/protos/stream.server.proto"
    );
    const grpcObject = grpc.loadPackageDefinition(definition);
    const service = grpcObject.serverStream[
      "ServerStreamService"
    ] as grpc.ServiceClientConstructor;
    const client = new service(
      "localhost:5000",
      grpc.credentials.createInsecure()
    );

    const result = await new Promise((resolve) => {
      let response: any;
      const call: grpc.ClientWritableStream<any> = client.testMethod({
        reqMessage: "test_startup",
      });
      call.on("data", (res) => {
        response = res;
      });
      call.on("end", () => {
        resolve(response);
      });
    });

    client.close();
    await startup.close();
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 5000);
    });

    expect(result).toEqual({
      resMessage: "test_startup",
    });
    expect(!!req.call).toBeTruthy();
    expect(!!req.metadata).toBeTruthy();
  }, 10000);
});
