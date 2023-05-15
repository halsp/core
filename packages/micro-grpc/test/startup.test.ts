import "../src";
import * as grpc from "@grpc/grpc-js";
import * as grpcLoader from "@grpc/proto-loader";
import { Request, Startup } from "@halsp/core";

describe("startup", () => {
  it("should handle middlewares", async () => {
    let req!: Request;
    const startup = new Startup()
      .useMicroGrpc({
        port: 5001,
        host: "0.0.0.0",
        protoFiles: "./test/protos/test.proto",
        credentials: grpc.ServerCredentials.createInsecure(),
      })
      .useMicroGrpc()
      .register("test.TestService/testMethod", (ctx) => {
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
      "0.0.0.0:5001",
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
      setTimeout(() => resolve(), 500);
    });

    expect(result).toEqual({
      resMessage: "test_startup",
    });
    expect(!!req.call).toBeTruthy();
    expect(!!req.metadata).toBeTruthy();
  });

  it("should return error when throw error in middleware", async () => {
    const startup = new Startup()
      .useMicroGrpc({
        port: 5002,
        host: "0.0.0.0",
        protoFiles: "./test/protos/test.proto",
        credentials: grpc.ServerCredentials.createInsecure(),
      })
      .register("test.TestService/testMethod", (ctx) => {
        ctx.res.setBody({
          resMessage: ctx.req.body.reqMessage,
        });
      })
      .use(() => {
        throw new Error("err");
      });
    await startup.listen();

    const definition = await grpcLoader.load("./test/protos/test.proto");
    const grpcObject = grpc.loadPackageDefinition(definition);
    const service = grpcObject.test[
      "TestService"
    ] as grpc.ServiceClientConstructor;
    const client = new service(
      "0.0.0.0:5002",
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
      setTimeout(() => resolve(), 500);
    });

    expect((result as Error).message.includes("UNKNOWN: err")).toBeTruthy();
  });

  it("should not add service when pattern is not exist", async () => {
    const startup = new Startup()
      .useMicroGrpc({
        port: 5003,
        host: "0.0.0.0",
        protoFiles: "./test/protos/test.proto",
        credentials: grpc.ServerCredentials.createInsecure(),
      })
      .register("test.TestService/not-exist", () => undefined);
    await startup.listen();
    await startup.close();
  }, 10000);
});

describe("shutdown", () => {
  it("should invoke forceShutdown when tryShutdown timeout", async () => {
    const startup = new Startup().useMicroGrpc();
    const server = await startup.listen();

    server.tryShutdown = (cb: () => void) => {
      setTimeout(() => cb(), 3000);
    };

    await startup.close();

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 2000);
    });
  }, 10000);

  it("should invoke forceShutdown when tryShutdown error", async () => {
    const startup = new Startup().useMicroGrpc();
    const server = await startup.listen();

    server.tryShutdown = (cb: (err: Error) => void) => {
      cb(new Error("err"));
    };

    await startup.close();
  });

  it("should throw error when bind error", async () => {
    const startup1 = new Startup().useMicroGrpc();
    await startup1.listen();

    const startup2 = new Startup().useMicroGrpc();

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

  it("should listen with HALSP_DEBUG_PORT", async () => {
    process.env.HALSP_DEBUG_PORT = "50001";
    const startup = new Startup().useMicroGrpc();
    const server = await startup.listen();
    await startup.close();

    expect(!!server).toBeTruthy();
  });

  it("should close right before listen", async () => {
    process.env.HALSP_DEBUG_PORT = "50002";
    const startup = new Startup().useMicroGrpc();
    await startup.close();
  });
});
