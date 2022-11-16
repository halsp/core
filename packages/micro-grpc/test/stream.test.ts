import {
  MicroGrpcStartup,
  ReadIterator,
  StreamIterator,
  WriteIterator,
} from "../src";
import * as grpc from "@grpc/grpc-js";
import * as grpcLoader from "@grpc/proto-loader";
import { Request } from "@ipare/core";

describe("stream", () => {
  it("should handle server stream message", async () => {
    let req!: Request;
    const startup = new MicroGrpcStartup({
      protoFiles: "./test/protos/stream.server.proto",
      port: 5011,
    })
      .pattern("serverStream.ServerStreamService/testMethod", (ctx) => {
        const body = ctx.res.body as WriteIterator;
        expect(ctx.res.body instanceof WriteIterator).toBeTruthy();
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
      "./test/protos/stream.server.proto"
    );
    const grpcObject = grpc.loadPackageDefinition(definition);
    const service = grpcObject.serverStream[
      "ServerStreamService"
    ] as grpc.ServiceClientConstructor;
    const client = new service(
      "localhost:5011",
      grpc.credentials.createInsecure()
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
      setTimeout(() => resolve(), 5000);
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
    const startup = new MicroGrpcStartup({
      protoFiles: "./test/protos/stream.client.proto",
      port: 5012,
    })
      .pattern("clientStream.ClientStreamService/testMethod", () => undefined)
      .use(async (ctx) => {
        req = ctx.req;
        const result = {
          resMessage: [] as string[],
        };
        expect(ctx.req.body instanceof ReadIterator).toBeTruthy();
        expect(ctx.req.body instanceof StreamIterator).toBeTruthy();
        for await (const item of ctx.req.body) {
          result.resMessage.push(item.reqMessage);
        }
        ctx.res.setBody(result);
      });
    await startup.listen();

    const definition = await grpcLoader.load(
      "./test/protos/stream.client.proto"
    );
    const grpcObject = grpc.loadPackageDefinition(definition);
    const service = grpcObject.clientStream[
      "ClientStreamService"
    ] as grpc.ServiceClientConstructor;
    const client = new service(
      "localhost:5012",
      grpc.credentials.createInsecure()
    );

    const result = await new Promise((resolve) => {
      const call: grpc.ClientWritableStream<any> = client.testMethod(
        (err: grpc.ServerErrorResponse | undefined, response: any) => {
          resolve(err ?? response);
        }
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
      setTimeout(() => resolve(), 5000);
    });

    expect(result).toEqual({
      resMessage: ["a", "b", "c"],
    });
    expect(!!req.call).toBeTruthy();
    expect(!!req.metadata).toBeTruthy();
  }, 10000);

  it("should handle client and server stream message", async () => {
    let req!: Request;
    const startup = new MicroGrpcStartup({
      protoFiles: "./test/protos/stream.cs.proto",
      port: 5013,
    })
      .pattern("csStream.CSStreamService/testMethod", () => undefined)
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
      "localhost:5013",
      grpc.credentials.createInsecure()
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
      setTimeout(() => resolve(), 5000);
    });

    expect(result).toEqual([
      {
        resMessage: ["a", "b", "c"],
      },
    ]);
    expect(!!req.call).toBeTruthy();
    expect(!!req.metadata).toBeTruthy();
  }, 10000);
});
