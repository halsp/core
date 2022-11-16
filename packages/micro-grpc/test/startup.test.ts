import { MicroGrpcOptions, MicroGrpcStartup } from "../src";
import * as grpc from "@grpc/grpc-js";
import * as grpcLoader from "@grpc/proto-loader";
import { Request } from "@ipare/core";
import { runin } from "@ipare/testing";

describe("startup", () => {
  it("should handle middlewares", async () => {
    let req!: Request;
    const startup = new MicroGrpcStartup({
      port: 5001,
      host: "localhost",
      protoFiles: "./test/protos/test.proto",
      credentials: grpc.ServerCredentials.createInsecure(),
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

    const definition = await grpcLoader.load("./test/protos/test.proto");
    const grpcObject = grpc.loadPackageDefinition(definition);
    const service = grpcObject.test[
      "TestService"
    ] as grpc.ServiceClientConstructor;
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

  it("should load default protos", async () => {
    await runin("test", async () => {
      async function test(options?: MicroGrpcOptions) {
        let req!: Request;
        const startup = new MicroGrpcStartup(options)
          .patterns({
            pattern: "test.TestService/testMethod",
            handler: (ctx) => {
              ctx.res.setBody({
                resMessage: ctx.req.body.reqMessage,
              });
            },
          })
          .use((ctx) => {
            req = ctx.req;
          });
        await startup.listen();

        const definition = await grpcLoader.load("./protos/test.proto");
        const grpcObject = grpc.loadPackageDefinition(definition);
        const service = grpcObject.test[
          "TestService"
        ] as grpc.ServiceClientConstructor;
        const client = new service(
          "localhost:5000",
          grpc.credentials.createInsecure()
        );

        const result = await new Promise((resolve) => {
          client.testMethod(
            { reqMessage: "test_default_protos" },
            (err: grpc.ServerErrorResponse | undefined, response: any) => {
              resolve(err ?? response);
            }
          );
        });

        client.close();
        await startup.close();
        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), 5000);
        });

        expect(result).toEqual({
          resMessage: "test_default_protos",
        });
        expect(!!req.call).toBeTruthy();
        expect(!!req.metadata).toBeTruthy();
      }

      await test();
      await test({});
      await test({
        protoFiles: "",
      });
      await test({
        protoFiles: [],
      });
    });
  }, 40000);
});

describe("shutdown", () => {
  it("should invoke forceShutdown when tryShutdown timeout", async () => {
    const startup = new MicroGrpcStartup();
    const server = await startup.listen();

    server.tryShutdown = (cb: () => void) => {
      setTimeout(() => cb(), 3000);
    };

    await startup.close();

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 2000);
    });
  });

  it("should invoke forceShutdown when tryShutdown error", async () => {
    const startup = new MicroGrpcStartup();
    const server = await startup.listen();

    server.tryShutdown = (cb: (err: Error) => void) => {
      cb(new Error("err"));
    };

    await startup.close();
  });

  it("should throw error when bind error", async () => {
    const startup1 = new MicroGrpcStartup();
    await startup1.listen();

    const startup2 = new MicroGrpcStartup();

    let err = false;
    try {
      await startup2.listen();
    } catch {
      err = true;
    }

    await startup1.close();
    await startup2.close();

    expect(err).toBeTruthy();
  });
});
