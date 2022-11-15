import { MicroGrpcStartup } from "../src";
import * as grpc from "@grpc/grpc-js";
import * as grpcLoader from "@grpc/proto-loader";
import { Request } from "@ipare/core";

describe("startup", () => {
  it("should handle middlewares", async () => {
    let req!: Request;
    const startup = new MicroGrpcStartup({
      port: 5001,
      host: "localhost",
      protoFiles: "./test/protos/test.proto",
    })
      .pattern("test.TestService/testMethod", (ctx) => {
        ctx.res.setBody({
          resMessage: ctx.req.body.reqMessage,
        });
      })
      .use((ctx) => {
        req = ctx.req;
      });
    await startup.listen();

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    const definition = await grpcLoader.load("./test/protos/test.proto");
    const grpcObject = grpc.loadPackageDefinition(definition);
    const service = grpcObject.test["TestService"];
    const client = new service(
      "localhost:5001",
      grpc.credentials.createInsecure()
    );

    const result = await new Promise((resolve) => {
      client.testMethod(
        { reqMessage: "test_startup" },
        (err: grpc.ServerErrorResponse | undefined, response: any) => {
          resolve(err ?? response);
        }
      );
    });

    await startup.close(true);

    expect(result).toEqual({
      resMessage: "test_startup",
    });
    expect(!!req.call).toBeTruthy();
    expect(!!req.metadata).toBeTruthy();
  });
});
