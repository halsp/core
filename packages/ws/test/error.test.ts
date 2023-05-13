import { Request, Startup } from "@halsp/core";
import "../src";
import "@halsp/testing";
import webSocket from "ws";

describe("error", () => {
  it("should be undefined when try accept failed", async () => {
    await new Startup()
      .keepThrow()
      .useWebSocket()
      .use(async (ctx) => {
        expect(await ctx.tryAcceptWebSocket()).toBeNull();
      })
      .test();
  });

  it("should throw error if method is not GET", async () => {
    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("Invalid HTTP method");
      })
      .setContext(new Request().setMethod("POST"))
      .useWebSocket()
      .use(async (ctx) => {
        await ctx.acceptWebSocket();
      })
      .test();
  });

  it("should throw error if Connection is not upgrade", async () => {
    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("Invalid Connection header");
      })
      .setContext(new Request().setMethod("GET"))
      .useWebSocket()
      .use(async (ctx) => {
        await ctx.acceptWebSocket();
      })
      .test();
  });

  it("should throw error if Upgrade is not websocket", async () => {
    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("Invalid Upgrade header");
      })
      .setContext(new Request().setMethod("GET").set("Connection", "upgrade"))
      .useWebSocket()
      .use(async (ctx) => {
        await ctx.acceptWebSocket();
      })
      .test();
  });

  it("should throw error if Sec-WebSocket-Key is invalid", async () => {
    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("Missing or invalid Sec-WebSocket-Key header");
      })
      .setContext(
        new Request()
          .setMethod("GET")
          .set("Connection", "upgrade")
          .set("Upgrade", "websocket")
      )
      .useWebSocket()
      .use(async (ctx) => {
        await ctx.acceptWebSocket();
      })
      .test();
  });

  it("should throw error if Sec-WebSocket-Version is invalid", async () => {
    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe(
          "Missing or invalid Sec-WebSocket-Version header"
        );
      })
      .setContext(
        new Request()
          .setMethod("GET")
          .set("Connection", "upgrade")
          .set("Upgrade", "websocket")
          .set("Sec-WebSocket-Key", "dGhlIHNhbXBsZSBub25jZQ==")
          .set("Sec-WebSocket-Version", "test")
      )
      .useWebSocket()
      .use(async (ctx) => {
        await ctx.acceptWebSocket();
      })
      .test();
  });

  it("should throw error if origin is not exist", async () => {
    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("The origin is not allowed");
      })
      .setContext(
        new Request()
          .setMethod("GET")
          .set("Connection", "upgrade")
          .set("Upgrade", "websocket")
          .set("Sec-WebSocket-Key", "dGhlIHNhbXBsZSBub25jZQ==")
          .set("Sec-WebSocket-Version", "13")
      )
      .useWebSocket({
        allowedOrigins: ["not-exist"],
      })
      .use(async (ctx) => {
        await ctx.acceptWebSocket();
      })
      .test();
  });

  it("should throw error if origin is not allowed", async () => {
    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("The origin is not allowed");
      })
      .setContext(
        new Request()
          .setMethod("GET")
          .set("Connection", "upgrade")
          .set("Upgrade", "websocket")
          .set("Sec-WebSocket-Key", "dGhlIHNhbXBsZSBub25jZQ==")
          .set("Sec-WebSocket-Version", "13")
          .set("Origin", "test-origin")
      )
      .useWebSocket({
        allowedOrigins: ["not-exist"],
      })
      .use(async (ctx) => {
        await ctx.acceptWebSocket();
      })
      .test();
  });

  it("should throw error if close server error", async () => {
    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("err");
      })
      .use(async (ctx, next) => {
        await next();

        const close = webSocket.Server.prototype.close;
        webSocket.Server.prototype.close = function (cb: any) {
          close.bind(this)();
          cb(new Error("err"));
        };
        try {
          await ctx.startup.closeWebSocket();
        } finally {
          webSocket.Server.prototype.close = close;
        }
      })
      .useWebSocket()
      .test();
  });
});
