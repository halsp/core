import { Middleware, Startup } from "@halsp/core";
import { WebSocket } from "../src";
import "@halsp/testing";
import "@halsp/native";
import WsClient from "ws";

describe("startup", () => {
  it("should receive and send data", async () => {
    new Startup()
      .expect((res) => {
        expect(res.status).toBe(200);
      })
      .useNative({
        port: 23360,
      })
      .useWebSocket()
      .use(async (ctx) => {
        const ws = await ctx.acceptWebSocket();
        ws.onmessage = async ({ data }) => {
          expect(data).toBe("abc");
          ws.send(data);
          ws.close();
          await ctx.startup.close();
        };
      })
      .listen();

    const ws = new WsClient("ws://localhost:23360");
    ws.on("open", () => {
      ws.send("abc");
    });

    await new Promise<void>((resolve) => {
      ws.onmessage = async ({ data }) => {
        expect(data).toBe("abc");
        ws.close();
        setTimeout(resolve, 1000);
      };
    });
  }, 20000);

  it("should accept web socket again with the same ws instance", async () => {
    new Startup()
      .useNative({
        port: 23361,
      })
      .useWebSocket({
        keepAliveTimeout: 1000 * 60,
      })
      .use(async (ctx) => {
        const ws = await ctx.tryAcceptWebSocket();
        if (!ws) throw new Error("err");
        expect(ws).toBe(await ctx.acceptWebSocket());
        expect(ws).toBe(await ctx.tryAcceptWebSocket());

        ws.close();
        await ctx.startup.close();
      })
      .listen();

    const client = new WsClient("ws://localhost:23361");
    await new Promise<void>((resolve) => {
      client.onclose = () => resolve();
    });
  }, 20000);

  it("should not wait for closing if readyState is CLOSED", async () => {
    new Startup()
      .useNative({
        port: 23362,
      })
      .useWebSocket()
      .use(async (ctx) => {
        const ws = await ctx.acceptWebSocket();
        ws.close();
        await ctx.startup.close();
      })
      .listen();

    const client = new WsClient("ws://localhost:23362");
    await new Promise<void>((resolve) => {
      client.onclose = () => resolve();
    });
  }, 20000);

  it("should get clients by ctx.webSocketClients", async () => {
    new Startup()
      .useNative({
        port: 23363,
      })
      .useWebSocket()
      .use(async (ctx) => {
        const ws = await ctx.acceptWebSocket();

        expect(ctx.webSocketClients.size).toBe(1);

        ws.close();
        await ctx.startup.close();
      })
      .listen();

    const client = new WsClient("ws://localhost:23363");
    await new Promise<void>((resolve) => {
      client.onclose = () => resolve();
    });
  }, 20000);
});

describe("decorator", () => {
  it("should get ws by decorator", async () => {
    class TestMiddleware extends Middleware {
      @WebSocket
      private readonly ws1!: WebSocket;
      @WebSocket()
      private readonly ws2!: WebSocket;

      async invoke() {
        expect(this.ws1).toBe(this.ws2);
        expect(this.ws1).toBe(await this.ctx.acceptWebSocket());

        this.ws1.close();
        await this.ctx.startup.close();
      }
    }

    new Startup()
      .useNative({
        port: 23363,
      })
      .useWebSocket()
      .add(TestMiddleware)
      .listen();

    const client = new WsClient("ws://localhost:23363");
    await new Promise<void>((resolve) => {
      client.onclose = () => resolve();
    });
  });
});
