import { ReadIterator, WriteIterator } from "../src/server";
import * as grpc from "@grpc/grpc-js";
import * as grpcLoader from "@grpc/proto-loader";
import { Request, Startup } from "@halsp/core";
import EventEmitter from "events";
import "../src/server";

describe("iterator", () => {
  it("should create write iterator", async () => {
    const writeIterator = new WriteIterator<string>();
    writeIterator.push("a");
    setTimeout(() => {
      writeIterator.push("b");
      writeIterator.push("c");
      setTimeout(() => {
        writeIterator.push("d");
        writeIterator.end();
      }, 500);
    }, 500);

    const result: string[] = [];
    for await (const item of writeIterator) {
      result.push(item);
    }

    expect(result).toEqual(["a", "b", "c", "d"]);
  });

  it("should create read iterator", async () => {
    const stream = new EventEmitter();
    const readIterator = new ReadIterator(stream as any);

    stream.emit("data", "a");
    setTimeout(() => {
      stream.emit("data", "b");
      stream.emit("data", "c");
      setTimeout(() => {
        stream.emit("data", "d");
        stream.emit("end");
      }, 500);
    }, 500);

    const result: string[] = [];
    for await (const item of readIterator) {
      result.push(item);
    }
    expect(result).toEqual(["a", "b", "c", "d"]);
  });
});

describe("stream", () => {
  it("should handle server stream message", async () => {
    let req!: Request;
    const startup = new Startup()
      .useMicroGrpc({
        protoFiles: "./test/protos/stream.server.proto",
        port: 5011,
      })
      .register("serverStream.ServerStreamService/testMethod", (ctx) => {
        expect(ctx.res.body instanceof WriteIterator).toBeTruthy();
        const body = ctx.res.body as WriteIterator;
        body.push({
          resMessage: "1",
        });
        body.push({
          resMessage: ctx.req.body.reqMessage,
        });
        setTimeout(() => {
          body.push({
            resMessage: "2",
          });
          setTimeout(() => {
            body.end();
          }, 1000);
        }, 1000);
      })
      .use((ctx) => {
        req = ctx.req;
      });
    await startup.listen();

    const definition = await grpcLoader.load(
      "./test/protos/stream.server.proto",
    );
    const grpcObject = grpc.loadPackageDefinition(definition);
    const service = grpcObject.serverStream[
      "ServerStreamService"
    ] as grpc.ServiceClientConstructor;
    const client = new service(
      "0.0.0.0:5011",
      grpc.credentials.createInsecure(),
    );

    const result = await new Promise((resolve) => {
      const response: any[] = [];
      const call: grpc.ClientWritableStream<any> = client.testMethod({
        reqMessage: "test_startup",
      });
      call.on("data", (res) => {
        response.push(res);
      });
      call.on("end", () => {
        resolve(response);
      });
    });

    client.close();
    await startup.close();
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    expect(result).toEqual([
      {
        resMessage: "1",
      },
      {
        resMessage: "test_startup",
      },
      {
        resMessage: "2",
      },
    ]);
    expect(!!req.call).toBeTruthy();
    expect(!!req.metadata).toBeTruthy();
  }, 15000);

  it("should handle client stream message", async () => {
    let req!: Request;
    const startup = new Startup()
      .useMicroGrpc({
        protoFiles: "./test/protos/stream.client.proto",
        port: 5012,
      })
      .register("clientStream.ClientStreamService/testMethod")
      .use(async (ctx) => {
        req = ctx.req;
        const result = {
          resMessage: [] as string[],
        };
        expect(ctx.req.body instanceof ReadIterator).toBeTruthy();
        for await (const item of ctx.req.body) {
          result.resMessage.push(item.reqMessage);
        }
        ctx.res.setBody(result);
      });
    await startup.listen();

    const definition = await grpcLoader.load(
      "./test/protos/stream.client.proto",
    );
    const grpcObject = grpc.loadPackageDefinition(definition);
    const service = grpcObject.clientStream[
      "ClientStreamService"
    ] as grpc.ServiceClientConstructor;
    const client = new service(
      "0.0.0.0:5012",
      grpc.credentials.createInsecure(),
    );

    const result = await new Promise((resolve) => {
      const call: grpc.ClientWritableStream<any> = client.testMethod(
        (err: grpc.ServerErrorResponse | undefined, response: any) => {
          resolve(err ?? response);
        },
      );
      call.write({
        reqMessage: ["a"],
      });
      call.write({
        reqMessage: "b",
      });
      call.write({
        reqMessage: "c",
      });
      call.end();
    });

    client.close();
    await startup.close();
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    expect(result).toEqual({
      resMessage: ["a", "b", "c"],
    });
    expect(!!req.call).toBeTruthy();
    expect(!!req.metadata).toBeTruthy();
  }, 10000);

  it("should return error when throw error in middleware", async () => {
    const startup = new Startup()
      .useMicroGrpc({
        protoFiles: "./test/protos/stream.server.proto",
        port: 5011,
      })
      .register("serverStream.ServerStreamService/testMethod", (ctx) => {
        expect(ctx.res.body instanceof WriteIterator).toBeTruthy();
        const body = ctx.res.body as WriteIterator;
        body.push({
          resMessage: "1",
        });
        body.end();
      })
      .use(() => {
        throw new Error("err");
      });
    await startup.listen();

    const definition = await grpcLoader.load(
      "./test/protos/stream.server.proto",
    );
    const grpcObject = grpc.loadPackageDefinition(definition);
    const service = grpcObject.serverStream[
      "ServerStreamService"
    ] as grpc.ServiceClientConstructor;
    const client = new service(
      "0.0.0.0:5011",
      grpc.credentials.createInsecure(),
    );

    const result = await new Promise((resolve) => {
      const response: any[] = [];
      const call: grpc.ClientWritableStream<any> = client.testMethod({
        reqMessage: "test_startup",
      });
      call.on("data", (res) => {
        response.push(res);
      });
      call.on("end", () => {
        resolve(response);
      });
      call.on("error", (err) => {
        resolve(err);
      });
    });

    client.close();
    await startup.close();
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    expect((result as Error).message.includes("UNKNOWN: err")).toBeTruthy();
  }, 10000);

  it("should handle client and server stream message", async () => {
    let req!: Request;
    const startup = new Startup()
      .useMicroGrpc({
        protoFiles: "./test/protos/stream.cs.proto",
        port: 5013,
      })
      .register("csStream.CSStreamService/testMethod")
      .use(async (ctx) => {
        req = ctx.req;
        const result = {
          resMessage: [] as string[],
        };
        for await (const item of ctx.req.body) {
          result.resMessage.push(item.reqMessage);
        }

        (ctx.res.body as WriteIterator).end();
        // for test: use object instead of iterator
        ctx.res.setBody(result);
      });
    await startup.listen();

    const definition = await grpcLoader.load("./test/protos/stream.cs.proto");
    const grpcObject = grpc.loadPackageDefinition(definition);
    const service = grpcObject.csStream[
      "CSStreamService"
    ] as grpc.ServiceClientConstructor;
    const client = new service(
      "0.0.0.0:5013",
      grpc.credentials.createInsecure(),
    );

    const result = await new Promise((resolve) => {
      const response: any[] = [];
      const call: grpc.ClientWritableStream<any> = client.testMethod();
      call.write({
        reqMessage: ["a"],
      });
      call.write({
        reqMessage: "b",
      });
      call.write({
        reqMessage: "c",
      });
      call.end();

      call.on("data", (res) => {
        response.push(res);
      });
      call.on("end", () => {
        resolve(response);
      });
    });

    client.close();
    await startup.close();
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    expect(result).toEqual([
      {
        resMessage: "a,b,c",
      },
    ]);
    expect(!!req.call).toBeTruthy();
    expect(!!req.metadata).toBeTruthy();
  }, 10000);
});
