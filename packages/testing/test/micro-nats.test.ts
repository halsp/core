import {
  createMock,
  JSONCodec,
  mockPkgName,
  TestMicroNatsStartup,
} from "../src/micro-nats";
import "@ipare/micro-nats";
import type nats from "nats";
import { MicroNatsClient } from "@ipare/micro-nats-client";

describe("micro-nats", () => {
  jest.mock(mockPkgName, () => createMock());

  it("should subscribe and publish", async () => {
    const startup = new TestMicroNatsStartup().pattern(
      "test_pattern",
      (ctx) => {
        ctx.res.body = ctx.req.body;
      }
    );
    await startup.listen();
    const client = new MicroNatsClient();
    await client["connect"]();

    const result = await client.send("test_pattern", "test_body");
    expect(result.data).toBe("test_body");

    await client.dispose();
    await startup.close();
  });

  it("should create mock headers", async () => {
    const startup = new TestMicroNatsStartup().pattern(
      "test_pattern_headers",
      (ctx) => {
        ctx.res.body = ctx.req.body;
        const resHeaders: nats.MsgHdrs = ctx.res.headers as any;
        const reqHeaders: nats.MsgHdrs = ctx.req.headers as any;

        expect(reqHeaders.get("req_h")).toBe("1");
        expect(reqHeaders.has("req_h")).toBeTruthy();
        expect(reqHeaders.keys()).toEqual(["req_h"]);
        expect(reqHeaders.values("not-exist")).toEqual([]);
        expect(reqHeaders.values("req_h")).toEqual(["1"]);
        resHeaders.set("res_h1", "1");
        resHeaders.append("res_h1", "1");
        resHeaders.append("res_h2", "2");
        resHeaders.set("res_h3", "3");
        resHeaders.delete("res_h3");
      }
    );
    await startup.listen();
    const client = new MicroNatsClient();
    await client["connect"]();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const natsPkg = require("nats");
    const headers = natsPkg.headers();
    headers.set("req_h", "1");
    const result = await client.send(
      "test_pattern_headers",
      "test_body",
      headers
    );
    expect(result.data).toBe("test_body");

    await client.dispose();
    await startup.close();
  });

  it("should create new mock client", async () => {
    const client1 = createMock();
    expect(client1.connect()).toBe(client1.connect());

    const client2 = createMock(false);
    expect(client2.connect()).not.toBe(client2.connect());
  });

  it("should subscribe and publish mock client", async () => {
    const str = JSON.stringify({
      id: "123",
      data: "d",
      pattern: "pt",
    });

    const client = createMock().connect();
    client.subscribe("subscribe_test", {
      callback: (err, opts) => {
        opts.respond(Uint8Array.from(Buffer.from(str)));
      },
    });

    client.publish("subscribe_test", Uint8Array.from(Buffer.from(str)));
  });

  it("should subscribe and reply mock client", async () => {
    const str = JSON.stringify({
      id: "123",
      data: "d",
      pattern: "pt",
    });

    const client = createMock().connect();
    client.subscribe("subscribe_test", {
      callback: (err, opts) => {
        opts.respond(Uint8Array.from(Buffer.from(str)));
      },
    });

    client.publish("subscribe_test", Uint8Array.from(Buffer.from(str)), {
      reply: "reply",
    });
  });

  it("should not mock packate when IS_LOCAL_TEST is true", () => {
    process.env.IS_LOCAL_TEST = "true";
    expect(mockPkgName).toBe("jest");
    process.env.IS_LOCAL_TEST = "";
  });

  it("should mock packate when IS_LOCAL_TEST is undefined", () => {
    process.env.IS_LOCAL_TEST = "";
    expect(mockPkgName).toBe("nats");
  });

  it("should encode data by JSONCodec", () => {
    expect(JSONCodec().encode({})).toEqual(Uint8Array.from(Buffer.from("{}")));
  });
});
